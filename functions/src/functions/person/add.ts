import { FunctionsError } from '@stevenkellner/firebase-function';
import { checkAuthentication, Firestore, Person, PersonAddFunctionBase, PersonAddFunctionParameters } from '@stevenkellner/team-conduct-api';

export class PersonAddFunction extends PersonAddFunctionBase {

    public async execute(parameters: PersonAddFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (personSnapshot.exists)
            throw new FunctionsError('already-exists', 'Person already exists');

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties));
    }
}
