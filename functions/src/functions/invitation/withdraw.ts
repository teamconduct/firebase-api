import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function/admin';
import { Invitation } from '../../types';
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';

export class InvitationWithdrawFunction extends FirebaseFunction<Invitation, void> {

    public parametersBuilder = Invitation.builder;

    public constructor() {
        super('InvitationWithdrawFunction');
    }


    public async execute(invitation: Invitation): Promise<void> {
        this.logger.log('InvitationWithdrawFunction.execute');

        await checkAuthentication(this.userId, invitation.teamId, 'team-manager');

        const invitationId = invitation.createId();
        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');

        await Firestore.shared.invitation(invitationId).remove();
    }
}
