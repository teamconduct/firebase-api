import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function/admin";
import { Person, Team } from "../../types";
import { Flattable, ObjectTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { checkAuthentication } from "../../checkAuthentication";
import { Firestore } from "../../Firestore";

export namespace PersonDeleteFunction {

    export type Parameters = {
        teamId: Team.Id,
        id: Person.Id
    }
}

export class PersonDeleteFunction extends FirebaseFunction<PersonDeleteFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonDeleteFunction.Parameters>, PersonDeleteFunction.Parameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder
    });

    public constructor() {
        super('PersonDeleteFunction');
    }

    public async execute(parameters: PersonDeleteFunction.Parameters): Promise<void> {
        this.logger.log('PersonDeleteFunction.execute');

        await checkAuthentication(this.userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');

        if (personSnapshot.data.signInProperties !== null)
            throw new FunctionsError('failed-precondition', 'Person is signed in');

        await Firestore.shared.person(parameters.teamId, parameters.id).remove();
    }
}
