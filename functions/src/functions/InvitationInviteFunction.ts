import * as functions from 'firebase-functions';
import { FirebaseFunction, ILogger } from 'firebase-function';
import { Invitation } from '../types/Invitation';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';

export class InvitationInviteFunction implements FirebaseFunction<Invitation, string> {

    public parametersBuilder = Invitation.builder;

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('InvitationInviteFunction.constructor', null, 'notice');
    }


    public async execute(invitation: Invitation): Promise<string> {
        this.logger.log('InvitationInviteFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, invitation.teamId, 'team-invitation-manager');

        const personSnapshot = await Firestore.shared.person(invitation.teamId, invitation.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');

        if (personSnapshot.data.signInProperties !== null)
            throw new functions.https.HttpsError('already-exists', 'Person already has an account');

        const invitationId = Invitation.createId(invitation);
        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (invitationSnapshot.exists)
            throw new functions.https.HttpsError('already-exists', 'Invitation already exists');

        await Firestore.shared.invitation(invitationId).set(invitation);

        return invitationId;
    }
}
