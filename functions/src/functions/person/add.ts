import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function/admin";
import { Person, PersonPrivateProperties, Team } from "../../types";
import { Flattable, ObjectTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { checkAuthentication } from "../../checkAuthentication";
import { Firestore } from "../../Firestore";

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

    public constructor() {
        super('PersonAddFunction');
    }

    public async execute(parameters: PersonAddFunction.Parameters): Promise<void> {
        this.logger.log('PersonAddFunction.execute');

        await checkAuthentication(this.userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (personSnapshot.exists)
            throw new FunctionsError('already-exists', 'Person already exists');

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties));
    }
}
