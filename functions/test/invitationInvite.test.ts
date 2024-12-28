import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { InvitationId } from '../src/types/Invitation';
import { Firestore } from '../src/Firestore';

describe('InvitationInviteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: Tagged.generate('person')
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

    it('should invite', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        expect(invitationId).to.be.equal(InvitationId.create({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        }).value);
        const invitationSnapshot = await Firestore.shared.invitation(new Tagged(invitationId, 'invitation')).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(true);
        expect(invitationSnapshot.data).to.be.deep.equal({
            teamId: testTeam.id.guidString,
            personId: testTeam.persons[1].id.guidString
        });
    });
});
