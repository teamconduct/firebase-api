import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { User } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('user/login', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.login.execute(null),
                'unauthenticated',
                'User is not authenticated.'
            );
        });
    });

    describe('given the user has no Firestore auth record', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.auth.signIn();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.login.execute(null),
                'not-found',
                'User authentication record not found.'
            );
        });
    });

    describe('given the auth record exists but the user document does not', () => {
        it('should throw a not-found error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            const randomUserId = RandomData.shared.userId();
            await FirebaseApp.shared.firestore.userAuth(authId).set({ userId: randomUserId });

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.login.execute(null),
                'not-found',
                'User not found.'
            );
        });
    });

    describe('given a registered and authenticated user', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should return the authenticated user', async () => {
            const result = await FirebaseApp.shared.functions.user.login.execute(null);

            expect(result).toBeInstanceOf(User);
            expect(result.properties.firstName).toBeEqual(FirebaseApp.shared.testTeam.persons[0].properties.firstName);
        });
    });
});
