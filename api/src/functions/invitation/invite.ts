import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Invitation } from '../../types';

export abstract class InvitationInviteFunctionBase extends FirebaseFunction<Invitation, Invitation.Id> {

    public parametersBuilder = Invitation.builder;

    public returnTypeBuilder = Invitation.Id.builder;
}
