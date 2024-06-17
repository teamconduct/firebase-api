import * as admin from 'firebase-admin';
import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam1 } from './testTeams/testTeam_1';
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
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should withdraw', async () => {
        const invitationId = Invitation.createId({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id
        });
        await admin.app().firestore().collection('invitations').doc(invitationId).set({
            teamId: testTeam1.id.guidString,
            personId: testTeam1.persons[1].id.guidString
        });
        await FirebaseApp.shared.functions.function('invitation').function('withdraw').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id
        });
        const invitationSnapshot = await FirebaseApp.shared.firestore.getSubCollection('invitations').getDocument(invitationId).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(false);
    });
});
