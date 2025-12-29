import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { checkAuthentication, Firestore, Invitation, InvitationWithdrawFunction } from '@stevenkellner/team-conduct-api';

export class InvitationWithdrawExecutableFunction extends InvitationWithdrawFunction implements ExecutableFirebaseFunction<Invitation, void> {

    public async execute(userAuthId: UserAuthId | null, invitation: Invitation): Promise<void> {

        await checkAuthentication(userAuthId, invitation.teamId, 'team-manager');

        const invitationId = invitation.createId();
        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');

        await Firestore.shared.invitation(invitationId).remove();
    }
}
