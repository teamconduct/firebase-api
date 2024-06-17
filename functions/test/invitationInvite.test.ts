import * as admin from 'firebase-admin';
import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';
import { Invitation } from '../src/types/Invitation';

describe('InvitationInviteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-invitation-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        await admin.app().firestore().collection('teams').doc(testTeam1.id.guidString).delete();
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam1.id,
            personId: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam1.id,
            personId: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person already has an account', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[0].id
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('invitation already exists', async () => {
        const invitationId = Invitation.createId({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id
        });
        await admin.app().firestore().collection('invitations').doc(invitationId).set({
            teamId: testTeam1.id.guidString,
            personId: testTeam1.persons[1].id.guidString
        });
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('should invite', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id
        });
        expect(invitationId).to.be.equal(Invitation.createId({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id
        }));
        const invitationSnapshot = await FirebaseApp.shared.firestore.getSubCollection('invitations').getDocument(invitationId).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(true);
        expect(invitationSnapshot.data).to.be.deep.equal({
            teamId: testTeam1.id.guidString,
            personId: testTeam1.persons[1].id.guidString
        });
    });
});
