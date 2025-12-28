import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { checkAuthentication, Firestore, Person, PersonAddFunction } from '@stevenkellner/team-conduct-api';

export class PersonAddExecutableFunction extends PersonAddFunction implements ExecutableFirebaseFunction<PersonAddFunction.Parameters, void> {

    public async execute(userId: string | null, parameters: PersonAddFunction.Parameters): Promise<void> {

        await checkAuthentication(userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (personSnapshot.exists)
            throw new FunctionsError('already-exists', 'Person already exists');

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties));
    }
}
