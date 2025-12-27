import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { checkAuthentication } from '../../firebase/checkAuthentication';
import { Firestore } from '../../firebase/Firestore';

export namespace PersonAddFunction {

    export type Parameters = {
        teamId: Team.Id
        id: Person.Id,
        properties: PersonPrivateProperties
    };
}

export class PersonAddFunction extends FirebaseFunction<PersonAddFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonAddFunction.Parameters>, PersonAddFunction.Parameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder,
        properties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: PersonAddFunction.Parameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (personSnapshot.exists)
            throw new FunctionsError('already-exists', 'Person already exists');

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties));
    }
}
