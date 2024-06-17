import * as functions from 'firebase-functions';
import { FirebaseFunction, ILogger } from 'firebase-function';
import { Invitation } from '../types/Invitation';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';

export class InvitationWithdrawFunction implements FirebaseFunction<Invitation, void> {

    public parametersBuilder = Invitation.builder;

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('InvitationWithdrawFunction.constructor', null, 'notice');
    }


    public async execute(invitation: Invitation): Promise<void> {
        this.logger.log('InvitationWithdrawFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, invitation.teamId, 'team-invitation-manager');

        const invitationId = Invitation.createId(invitation);
        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Invitation not found');

        await Firestore.shared.invitation(invitationId).remove();
    }
}
