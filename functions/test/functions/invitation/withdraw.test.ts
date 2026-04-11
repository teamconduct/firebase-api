import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { Invitation } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('invitation/withdraw', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.withdraw.execute(
                    new Invitation(RandomData.shared.teamId(), RandomData.shared.personId())
                ),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have team-manager role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('person-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.withdraw.execute(
                    new Invitation(testTeam.id, testTeam.persons[1].id)
                ),
                'permission-denied'
            );
        });
    });

    describe('given the invitation does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.withdraw.execute(
                    new Invitation(testTeam.id, testTeam.persons[1].id)
                ),
                'not-found',
                'Invitation not found.'
            );
        });
    });

    describe('given a valid setup with an existing invitation', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should remove the invitation from Firestore', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const invitation = new Invitation(testTeam.id, testTeam.persons[1].id);
            const invitationId = invitation.createId();
            await FirebaseApp.shared.firestore.invitation(invitationId).set(invitation);

            await FirebaseApp.shared.functions.invitation.withdraw.execute(invitation);

            const snapshot = await FirebaseApp.shared.firestore.invitation(invitationId).snapshot();
            expect(snapshot.exists).toBeFalse();
        });
    });
});