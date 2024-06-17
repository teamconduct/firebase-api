import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Invitation } from '../src/types/Invitation';

describe('InvitationInviteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-invitation-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person already has an account', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('invitation already exists', async () => {
        const invitationId = Invitation.createId({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await FirebaseApp.shared.firestore.collection('invitations').document(invitationId).set({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('should invite', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        expect(invitationId).to.be.equal(Invitation.createId({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        }));
        const invitationSnapshot = await FirebaseApp.shared.firestore.collection('invitations').document(invitationId).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(true);
        expect(invitationSnapshot.data).to.be.deep.equal({
            teamId: testTeam.id.guidString,
            personId: testTeam.persons[1].id.guidString
        });
    });
});
