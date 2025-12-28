import { FunctionsError } from '@stevenkellner/firebase-function';
import { checkAuthentication, Firestore, Invitation, InvitationWithdrawFunctionBase } from '@stevenkellner/team-conduct-api';

export class InvitationWithdrawFunction extends InvitationWithdrawFunctionBase {

    public async execute(invitation: Invitation): Promise<void> {

        await checkAuthentication(this.userId, invitation.teamId, 'team-manager');

        const invitationId = invitation.createId();
        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');

        await Firestore.shared.invitation(invitationId).remove();
    }
}
