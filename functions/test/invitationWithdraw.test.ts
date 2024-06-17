import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';
import { Invitation } from '../src/types/Invitation';

describe('InvitationWithdrawFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-invitation-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('invitation not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('withdraw').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should withdraw', async () => {
        const invitationId = Invitation.createId({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await FirebaseApp.shared.firestore.collection('invitations').document(invitationId).set({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await FirebaseApp.shared.functions.function('invitation').function('withdraw').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        const invitationSnapshot = await FirebaseApp.shared.firestore.collection('invitations').document(invitationId).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(false);
    });
});
