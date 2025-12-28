import { FunctionsError } from '@stevenkellner/firebase-function';
import { Firestore, PersonDeleteFunctionBase, PersonDeleteFunctionParameters, checkAuthentication } from '@stevenkellner/team-conduct-api';

export class PersonDeleteFunction extends PersonDeleteFunctionBase {

    public async execute(parameters: PersonDeleteFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');

        if (personSnapshot.data.signInProperties !== null)
            throw new FunctionsError('failed-precondition', 'Person is signed in');

        await Firestore.shared.person(parameters.teamId, parameters.id).remove();
    }
}
