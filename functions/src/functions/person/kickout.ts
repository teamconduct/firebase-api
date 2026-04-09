import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { PersonKickoutFunction, User, Person } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore, NotificationSender } from '../../firebase';

export class PersonKickoutExecutableFunction extends PersonKickoutFunction implements ExecutableFirebaseFunction<PersonKickoutFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: PersonKickoutFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, 'team-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found.');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties === null)
            throw new FunctionsError('unavailable', 'User is not signed in');
        const userId = person.signInProperties.userId;

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');
        const user = User.builder.build(userSnapshot.data);

        const batch = Firestore.shared.batch();

        person.signInProperties = null;
        batch.set(Firestore.shared.person(parameters.teamId, parameters.personId), person);

        user.teams.delete(parameters.teamId);
        batch.set(Firestore.shared.user(userId), user);

        await batch.commit();

        await NotificationSender.forUser(userId).teamKickout(parameters.teamId);
    }
}
