import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Invitation } from '../../types';

export class InvitationInviteFunction implements FirebaseFunction<Invitation, Invitation.Id> {

    public parametersBuilder = Invitation.builder;

    public returnTypeBuilder = Invitation.Id.builder;
}
