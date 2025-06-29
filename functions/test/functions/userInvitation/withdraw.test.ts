import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { Invitation } from '@stevenkellner/team-conduct-api';

describe('InvitationWithdrawFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('invitation not found', async () => {
        const result = await FirebaseApp.shared.functions.invitation.withdraw.executeWithResult(new Invitation(
            FirebaseApp.shared.testTeam.id,
            FirebaseApp.shared.testTeam.persons[1].id
        ));
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Invitation not found')));
    });

    it('should withdraw person', async () => {
        const invitation = new Invitation(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id);
        const invitationId = invitation.createId();
        await FirebaseApp.shared.firestore.invitation(invitationId).set(invitation);
        await FirebaseApp.shared.functions.invitation.withdraw.execute(invitation);
        const invitationSnapshot = await FirebaseApp.shared.firestore.invitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeFalse();
    });

    it('should withdraw club', async () => {
        const invitation = new Invitation(FirebaseApp.shared.testTeam.id, null);
        const invitationId = invitation.createId();
        await FirebaseApp.shared.firestore.invitation(invitationId).set(invitation);
        await FirebaseApp.shared.functions.invitation.withdraw.execute(invitation);
        const invitationSnapshot = await FirebaseApp.shared.firestore.invitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeFalse();
    });
});
