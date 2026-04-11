import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Invitation, InvitationRegisterFunction, Person, PersonSignInProperties, Team, User } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { Firestore } from '../../firebase';

export class InvitationRegisterExecutableFunction extends InvitationRegisterFunction implements ExecutableFirebaseFunction<InvitationRegisterFunction.Parameters, User> {

    public async execute(userAuthId: UserAuthId | null, parameters: InvitationRegisterFunction.Parameters): Promise<User> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated.');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found.');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties !== null)
            throw new FunctionsError('already-exists', 'Person is already registered.');

        const personInvitationId = new Invitation(parameters.teamId, parameters.personId).createId();
        const teamInvitationId = new Invitation(parameters.teamId, null).createId();
        const [personInvitationSnapshot, teamInvitationSnapshot] = await Promise.all([
            Firestore.shared.invitation(personInvitationId).snapshot(),
            Firestore.shared.invitation(teamInvitationId).snapshot()
        ]);
        if (!personInvitationSnapshot.exists && !teamInvitationSnapshot.exists)
            throw new FunctionsError('not-found', 'No valid invitation found for this team and person.');

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found.');
        const team = Team.builder.build(teamSnapshot.data);

        const batch = Firestore.shared.batch();

        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (!userAuthSnapshot.exists)
            throw new FunctionsError('not-found', 'User authentication not found.');
        const userId = User.Id.builder.build(userAuthSnapshot.data.userId);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');
        const user = User.builder.build(userSnapshot.data);

        if (user.teams.has(parameters.teamId))
            throw new FunctionsError('already-exists', 'User is already a member of this team.');

        const teamPersonProperties = new User.TeamProperties(parameters.teamId, team.name, parameters.personId);
        user.teams.set(parameters.teamId, teamPersonProperties);
        batch.set(Firestore.shared.user(user.id), user);

        person.signInProperties = new PersonSignInProperties(user.id, UtcDate.now, []);
        batch.set(Firestore.shared.person(parameters.teamId, parameters.personId), person);

        await batch.commit();

        return user;
    }
}
