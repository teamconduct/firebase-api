import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('notification/register', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.notification.register.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId(),
                    token: 'device-token-abc'
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have any required role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam([] as import('@stevenkellner/team-conduct-api').TeamRole[]);
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.notification.register.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[0].id,
                    token: 'device-token-abc'
                }),
                'permission-denied'
            );
        });
    });

    describe('given a valid authenticated user with team-manager role', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should register the device token for the user', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const authSnap = await FirebaseApp.shared.firestore.userAuth(testUserAuthId).snapshot();
            const userId = User.Id.builder.build(authSnap.data.userId);
            const deviceToken = 'device-token-abc-123';

            await FirebaseApp.shared.functions.notification.register.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[0].id,
                token: deviceToken
            });

            const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
            const updatedUser = User.builder.build(userSnapshot.data);
            expect(updatedUser.settings.notification.tokens.values.some(t => t === deviceToken)).toBeTrue();
        });
    });

    describe('given the same token is registered twice', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should not duplicate the token in the user token list', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const authSnap = await FirebaseApp.shared.firestore.userAuth(testUserAuthId).snapshot();
            const userId = User.Id.builder.build(authSnap.data.userId);
            const deviceToken = 'duplicate-token-123';

            await FirebaseApp.shared.functions.notification.register.execute({
                teamId: testTeam.id, personId: testTeam.persons[0].id, token: deviceToken
            });
            await FirebaseApp.shared.functions.notification.register.execute({
                teamId: testTeam.id, personId: testTeam.persons[0].id, token: deviceToken
            });

            const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
            const updatedUser = User.builder.build(userSnapshot.data);
            const tokenInstances = updatedUser.settings.notification.tokens.values.filter(t => t === deviceToken);
            expect(tokenInstances.length).toBeEqual(1);
        });
    });
});