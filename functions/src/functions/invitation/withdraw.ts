import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Invitation, InvitationWithdrawFunction } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class InvitationWithdrawExecutableFunction extends InvitationWithdrawFunction implements ExecutableFirebaseFunction<Invitation, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: Invitation): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, 'team-manager');

        const invitationId = parameters.createId();
        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found.');

        await Firestore.shared.invitation(invitationId).remove();
    }
}
