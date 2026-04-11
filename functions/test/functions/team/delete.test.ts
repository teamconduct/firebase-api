import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('team/delete', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.team.delete.execute({ id: RandomData.shared.teamId() }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the team-manager role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('person-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.team.delete.execute({ id: testTeam.id }),
                'permission-denied'
            );
        });
    });

    describe('given a valid authenticated team-manager', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should delete the team document from Firestore', async () => {
            const testTeam = FirebaseApp.shared.testTeam;

            await FirebaseApp.shared.functions.team.delete.execute({ id: testTeam.id });

            const teamSnapshot = await FirebaseApp.shared.firestore.team(testTeam.id).snapshot();
            expect(teamSnapshot.exists).toBeFalse();
        });

        it('should remove the team from the user\'s teams dictionary', async () => {
            const testTeam = FirebaseApp.shared.testTeam;

            await FirebaseApp.shared.functions.team.delete.execute({ id: testTeam.id });

            const userAuthSnapshot = await FirebaseApp.shared.firestore.userAuth(testUserAuthId).snapshot();
            const linkedUserId = User.Id.builder.build(userAuthSnapshot.data.userId);
            const userSnapshot = await FirebaseApp.shared.firestore.user(linkedUserId).snapshot();
            const user = User.builder.build(userSnapshot.data);

            expect(user.teams.has(testTeam.id)).toBeFalse();
        });
    });
});

