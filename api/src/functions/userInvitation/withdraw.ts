import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { UserInvitation } from '../../types';
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';
import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class UserInvitationWithdrawFunction extends FirebaseFunction<UserInvitation, void> {

    public parametersBuilder = UserInvitation.builder;

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(invitation: UserInvitation): Promise<void> {

        await checkAuthentication(this.userId, invitation.teamId, 'team-manager');

        const invitationId = invitation.createId();
        const invitationSnapshot = await Firestore.shared.userInvitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');

        await Firestore.shared.userInvitation(invitationId).remove();
    }
}
