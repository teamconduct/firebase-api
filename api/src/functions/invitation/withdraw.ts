import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Invitation } from '../../types';
import { checkAuthentication } from '../../firebase/checkAuthentication';
import { Firestore } from '../../firebase/Firestore';
import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class InvitationWithdrawFunction extends FirebaseFunction<Invitation, void> {

    public parametersBuilder = Invitation.builder;

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(invitation: Invitation): Promise<void> {

        await checkAuthentication(this.userId, invitation.teamId, 'team-manager');

        const invitationId = invitation.createId();
        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');

        await Firestore.shared.invitation(invitationId).remove();
    }
}
