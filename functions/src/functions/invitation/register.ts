import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { InvitationRegisterFunction, User, Team, Person, PersonSignInProperties, Invitation, Firestore } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

export class InvitationRegisterExecutableFunction extends InvitationRegisterFunction implements ExecutableFirebaseFunction<InvitationRegisterFunction.Parameters, User> {

    public async execute(userAuthId: UserAuthId | null, parameters: InvitationRegisterFunction.Parameters): Promise<User> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User not authenticated');
        const user = await this.getUser(userAuthId);

        if (user.teams.has(parameters.teamId))
            throw new FunctionsError('already-exists', 'User already in team');

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties !== null)
            throw new FunctionsError('already-exists', 'Person already registered');

        await this.removeUserInvitation(parameters.teamId, parameters.personId);

        user.teams.set(parameters.teamId, new User.TeamProperties(parameters.teamId, team.name, parameters.personId));
        await Firestore.shared.user(userId).set(user);

        person.signInProperties = new PersonSignInProperties(userId, UtcDate.now);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);

        return user;
    }

    private async getUser(userAuthId: UserAuthId): Promise<User> {
        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (!userAuthSnapshot.exists)
            throw new FunctionsError('not-found', 'User authentication not found');
        const userId = User.Id.builder.build(userAuthSnapshot.data);
        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (userSnapshot.exists)
            return User.builder.build(userSnapshot.data);
        return new User(userId, UtcDate.now);
    }

    private async removeUserInvitation(teamId: Team.Id, personId: Person.Id) {
        const invitation = new Invitation(teamId, personId);
        const invitationId = invitation.createId();
        await Firestore.shared.invitation(invitationId).remove();
    }
}
