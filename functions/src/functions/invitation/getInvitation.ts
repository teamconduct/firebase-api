import { FunctionsError } from '@stevenkellner/firebase-function';
import { InvitationGetInvitationFunctionBase, Invitation, Team, Person, Firestore, InvitationGetInvitationFunctionReturnType } from '@stevenkellner/team-conduct-api';
import { compactMap } from '@stevenkellner/typescript-common-functionality';

export class InvitationGetInvitationFunction extends InvitationGetInvitationFunctionBase {

    public async execute(invitationId: Invitation.Id): Promise<InvitationGetInvitationFunctionReturnType> {

        if (this.userId === null)
            throw new FunctionsError('unauthenticated', 'User not authenticated');

        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');
        const invitation = Invitation.builder.build(invitationSnapshot.data);

        const teamSnapshot = await Firestore.shared.team(invitation.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        if (invitation.personId !== null)
            return InvitationGetInvitationFunctionReturnType.from(invitation.teamId, team.name, invitation.personId);

        const personSnapshots = await Firestore.shared.persons(invitation.teamId).documentSnapshots();
        const persons = compactMap(personSnapshots, personSnapshot => {
            if (!personSnapshot.exists)
                return null;
            const person = Person.builder.build(personSnapshot.data);
            if (person.signInProperties !== null)
                return null;
            return {
                id: person.id,
                properties: person.properties
            };
        });
        return InvitationGetInvitationFunctionReturnType.from(invitation.teamId, team.name, persons);
    }
}
