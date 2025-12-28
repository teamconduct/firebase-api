import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Invitation } from '../../types';
import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class InvitationWithdrawFunction implements FirebaseFunction<Invitation, void> {

    public parametersBuilder = Invitation.builder;

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
