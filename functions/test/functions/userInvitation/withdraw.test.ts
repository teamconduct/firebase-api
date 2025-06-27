import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { UserInvitation } from '@stevenkellner/team-conduct-api';

describe('UserInvitationWithdrawFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('invitation not found', async () => {
        const result = await FirebaseApp.shared.functions.userInvitation.withdraw.executeWithResult(new UserInvitation(
            FirebaseApp.shared.testTeam.id,
            FirebaseApp.shared.testTeam.persons[1].id
        ));
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Invitation not found')));
    });

    it('should withdraw', async () => {
        const invitation = new UserInvitation(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id);
        const invitationId = invitation.createId();
        await FirebaseApp.shared.firestore.userInvitation(invitationId).set(invitation);
        await FirebaseApp.shared.functions.userInvitation.withdraw.execute(invitation);
        const invitationSnapshot = await FirebaseApp.shared.firestore.userInvitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeFalse();
    });
});
