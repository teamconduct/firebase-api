import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Firestore, PersonDeleteFunction, checkAuthentication } from '@stevenkellner/team-conduct-api';

export class PersonDeleteExecutableFunction extends PersonDeleteFunction implements ExecutableFirebaseFunction<PersonDeleteFunction.Parameters, void> {

    public async execute(userId: string | null, parameters: PersonDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');

        if (personSnapshot.data.signInProperties !== null)
            throw new FunctionsError('failed-precondition', 'Person is signed in');

        await Firestore.shared.person(parameters.teamId, parameters.id).remove();
    }
}
