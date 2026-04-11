import { describe, it, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { Invitation } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('invitation/getInvitation', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the invitation does not exist', () => {
        it('should throw a not-found error', async () => {
            const fakeId = new Invitation(RandomData.shared.teamId(), RandomData.shared.personId()).createId();

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.getInvitation.execute(fakeId),
                'not-found',
                'Invitation not found.'
            );
        });
    });

    describe('given the invitation exists but the team does not', () => {
        it('should throw a not-found error', async () => {
            const teamId = RandomData.shared.teamId();
            const personId = RandomData.shared.personId();
            const invitation = new Invitation(teamId, personId);
            const invitationId = invitation.createId();
            await FirebaseApp.shared.firestore.invitation(invitationId).set(invitation);

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.getInvitation.execute(invitationId),
                'not-found',
                'Team not found.'
            );
        });
    });

    describe('given a person-specific invitation', () => {
        it('should return the result with personId', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;
            const invitation = new Invitation(testTeam.id, testTeam.persons[1].id);
            const invitationId = invitation.createId();
            await FirebaseApp.shared.firestore.invitation(invitationId).set(invitation);

            const result = await FirebaseApp.shared.functions.invitation.getInvitation.execute(invitationId);

            expect(result.teamId.guidString).toBeEqual(testTeam.id.guidString);
            expect(result.personId?.guidString).toBeEqual(testTeam.persons[1].id.guidString);
        });
    });

    describe('given an open team invitation with unsigned persons', () => {
        it('should return the result with unsigned persons list', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;
            const invitation = new Invitation(testTeam.id, null);
            const invitationId = invitation.createId();
            await FirebaseApp.shared.firestore.invitation(invitationId).set(invitation);

            const result = await FirebaseApp.shared.functions.invitation.getInvitation.execute(invitationId);

            expect(result.teamId.guidString).toBeEqual(testTeam.id.guidString);
            expect(result.personId).toBeNull();
            expect(result.persons).not.toBeNull();
            expect(result.persons!.length).toBeGreaterThanOrEqual(1);
        });
    });
});
