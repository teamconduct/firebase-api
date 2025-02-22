import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function";
import { Person, PersonPrivateProperties, Team } from "../../types";
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { checkAuthentication } from "../../checkAuthentication";
import { Firestore } from "../../Firestore";

export namespace PersonUpdateFunction {

    export type Parameters = {
        teamId: Team.Id,
        id: Person.Id,
        properties: PersonPrivateProperties
    };
}

export class PersonUpdateFunction extends FirebaseFunction<PersonUpdateFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonUpdateFunction.Parameters>, PersonUpdateFunction.Parameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder,
        properties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: PersonUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties, person.fineIds, person.signInProperties));
    }
}
