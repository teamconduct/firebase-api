import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Person, PersonSignInProperties, Team, User, Invitation } from '../../types';
import { Firestore } from '../../Firestore';
import { Flattable, ObjectTypeBuilder, UtcDate } from '@stevenkellner/typescript-common-functionality';

export namespace InvitationRegisterFunction {

    export type Parameters = {
        teamId: Team.Id
        personId: Person.Id
    };
}

export class InvitationRegisterFunction extends FirebaseFunction<InvitationRegisterFunction.Parameters, User> {

    public parametersBuilder =  new ObjectTypeBuilder<Flattable.Flatten<InvitationRegisterFunction.Parameters>, InvitationRegisterFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder
    });

    public returnTypeBuilder = User.builder;

    public async execute(parameters: InvitationRegisterFunction.Parameters): Promise<User> {

        if (this.userId === null)
            throw new FunctionsError('unauthenticated', 'User not authenticated');
        const userId = User.Id.builder.build(this.userId);
        const user = await this.getUser(userId);

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

        user.teams.set(parameters.teamId, new User.TeamProperties(team.name, parameters.personId));
        await Firestore.shared.user(userId).set(user);

        person.signInProperties = new PersonSignInProperties(userId, UtcDate.now);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);

        return user;
    }

    private async getUser(userId: User.Id): Promise<User> {
        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (userSnapshot.exists)
            return User.builder.build(userSnapshot.data);
        return new User(userId);
    }

    private async removeUserInvitation(teamId: Team.Id, personId: Person.Id) {
        const invitation = new Invitation(teamId, personId);
        const invitationId = invitation.createId();
        await Firestore.shared.invitation(invitationId).remove();
    }
}
