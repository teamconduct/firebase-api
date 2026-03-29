import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Person, PersonAddFunction } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class PersonAddExecutableFunction extends PersonAddFunction implements ExecutableFirebaseFunction<PersonAddFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: PersonAddFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, { anyOf: ['team-manager', 'person-manager'] });

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (personSnapshot.exists)
            throw new FunctionsError('already-exists', 'Person already exists');

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties));
    }
}
