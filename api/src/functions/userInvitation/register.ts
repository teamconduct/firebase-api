import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { UserInvitation, Person, PersonSignInProperties, Team, User } from '../../types';
import { Firestore } from '../../Firestore';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

export class UserInvitationRegisterFunction extends FirebaseFunction<UserInvitation.Id, User> {

    public parametersBuilder = UserInvitation.Id.builder;

    public returnTypeBuilder = User.builder;

    public async execute(invitationId: UserInvitation.Id): Promise<User> {

        if (this.userId === null)
            throw new FunctionsError('unauthenticated', 'User not authenticated');
        const userId = User.Id.builder.build(this.userId);

        const invitationSnapshot = await Firestore.shared.userInvitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');
        const invitation = UserInvitation.builder.build(invitationSnapshot.data);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        let user = new User(userId);
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data);

        if (user.teams.has(invitation.teamId))
            throw new FunctionsError('already-exists', 'User already in team');

        const teamSnapshot = await Firestore.shared.team(invitation.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        const personSnapshot = await Firestore.shared.person(invitation.teamId, invitation.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties !== null)
            throw new FunctionsError('already-exists', 'Person already registered');

        await Firestore.shared.userInvitation(invitationId).remove();

        user.teams.set(invitation.teamId, new User.TeamProperties(team.name, invitation.personId));
        await Firestore.shared.user(userId).set(user);

        person.signInProperties = new PersonSignInProperties(userId, UtcDate.now);
        await Firestore.shared.person(invitation.teamId, invitation.personId).set(person);

        return user;
    }
}
