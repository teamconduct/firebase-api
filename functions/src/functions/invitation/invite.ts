import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Invitation, InvitationInviteFunction, Person, Team } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class InvitationInviteExecutableFunction extends InvitationInviteFunction implements ExecutableFirebaseFunction<Invitation, Invitation.Id> {

    public async execute(userAuthId: UserAuthId | null, parameters: Invitation): Promise<Invitation.Id> {

        await checkAuthentication(userAuthId, parameters.teamId, 'team-manager');

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found.');
        const team = Team.builder.build(teamSnapshot.data);

        if (parameters.personId === null && team.settings.joinRequestType === 'invite-only')
            throw new FunctionsError('permission-denied', 'Team is invite-only; a person ID is required for direct invitations.');

        if (parameters.personId !== null) {
            const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
            if (!personSnapshot.exists)
                throw new FunctionsError('not-found', 'Person not found.');
            const person = Person.builder.build(personSnapshot.data);
            if (person.signInProperties !== null)
                throw new FunctionsError('already-exists', 'Person is already registered.');
        }

        const invitationId = parameters.createId();
        await Firestore.shared.invitation(invitationId).set(parameters);

        return invitationId;
    }
}
