import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('user/register', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            const freshUserId = RandomData.shared.userId();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.register.execute({
                    userId: freshUserId,
                    signInType: new User.SignInType.OAuth('google'),
                    firstName: 'Jane',
                    lastName: 'Smith'
                }),
                'unauthenticated',
                'User is not authenticated.'
            );
        });
    });

    describe('given the user auth record already exists in Firestore', () => {
        it('should throw an already-exists error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            const existingUserId = RandomData.shared.userId();
            await FirebaseApp.shared.firestore.userAuth(authId).set({ userId: existingUserId });

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.register.execute({
                    userId: RandomData.shared.userId(),
                    signInType: new User.SignInType.OAuth('google'),
                    firstName: 'Jane',
                    lastName: 'Smith'
                }),
                'already-exists',
                'User is already registered.'
            );
        });
    });

    describe('given the user document already exists in Firestore', () => {
        it('should throw an already-exists error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            const existingUserId = RandomData.shared.userId();
            const existingUser = new User(
                existingUserId,
                UtcDate.now,
                new User.SignInType.OAuth('google'),
                new User.Properties('Existing', 'User', null, null),
                new User.Settings(new NotificationProperties())
            );
            await FirebaseApp.shared.firestore.user(existingUserId).set(existingUser);

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.register.execute({
                    userId: existingUserId,
                    signInType: new User.SignInType.OAuth('google'),
                    firstName: 'New',
                    lastName: 'Person'
                }),
                'already-exists',
                'User is already registered.'
            );
        });
    });

    describe('given a valid new user registration', () => {
        let freshUserId: User.Id;

        beforeEach(async () => {
            await FirebaseApp.shared.auth.signIn('register-test@example.com', 'Test1234!');
            freshUserId = RandomData.shared.userId();
        });

        it('should create and return the new user', async () => {
            const result = await FirebaseApp.shared.functions.user.register.execute({
                userId: freshUserId,
                signInType: new User.SignInType.OAuth('google'),
                firstName: 'New',
                lastName: 'User'
            });

            expect(result).toBeInstanceOf(User);
            expect(result.properties.firstName).toBeEqual('New');
            expect(result.properties.lastName).toBeEqual('User');
        });

        it('should persist the user auth record and user document in Firestore', async () => {
            await FirebaseApp.shared.functions.user.register.execute({
                userId: freshUserId,
                signInType: new User.SignInType.OAuth('google'),
                firstName: 'Persisted',
                lastName: 'User'
            });

            expect((await FirebaseApp.shared.firestore.user(freshUserId).snapshot()).exists).toBeTrue();
        });
    });
});
