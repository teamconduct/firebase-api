import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('user/update', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'do-not-update',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: 'do-not-update'
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user has no Firestore auth record', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.auth.signIn();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'do-not-update',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: 'do-not-update'
                }),
                'permission-denied'
            );
        });
    });

    describe('given the user document does not exist', () => {
        it('should throw a permission-denied error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            await FirebaseApp.shared.firestore.userAuth(authId).set({ userId: RandomData.shared.userId() });

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'do-not-update',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: 'do-not-update'
                }),
                'permission-denied'
            );
        });
    });

    describe('given a valid authenticated user', () => {
        let testUserAuthId: UserAuthId;
        let userId: User.Id;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
            const authSnap = await FirebaseApp.shared.firestore.userAuth(testUserAuthId).snapshot();
            userId = User.Id.builder.build(authSnap.data.userId);
        });

        describe('when updating the name', () => {
            it('should update first name and last name', async () => {
                await FirebaseApp.shared.functions.user.update.execute({
                    name: { firstName: 'New', lastName: 'Name' },
                    bio: 'do-not-update',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: 'do-not-update'
                });

                const updated = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);
                expect(updated.properties.firstName).toBeEqual('New');
                expect(updated.properties.lastName).toBeEqual('Name');
            });
        });

        describe('when updating the bio', () => {
            it('should set the bio to the provided value', async () => {
                await FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'My bio',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: 'do-not-update'
                });

                const updated = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);
                expect(updated.properties.bio).toBeEqual('My bio');
            });

            it('should remove the bio when given "remove"', async () => {
                await FirebaseApp.shared.functions.user.update.execute({ name: 'do-not-update', bio: 'Initial bio', profilePictureUrl: 'do-not-update', notificationSubscriptions: 'do-not-update' });
                await FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'remove',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: 'do-not-update'
                });

                const updated = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);
                expect(updated.properties.bio).toBeNull();
            });
        });

        describe('when updating the profile picture URL', () => {
            it('should set the profile picture URL to the provided value', async () => {
                await FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'do-not-update',
                    profilePictureUrl: 'https://example.com/pic.jpg',
                    notificationSubscriptions: 'do-not-update'
                });

                const updated = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);
                expect(updated.properties.profilePictureUrl).toBeEqual('https://example.com/pic.jpg');
            });

            it('should remove the profile picture URL when given "remove"', async () => {
                await FirebaseApp.shared.functions.user.update.execute({ name: 'do-not-update', bio: 'do-not-update', profilePictureUrl: 'https://example.com/old.jpg', notificationSubscriptions: 'do-not-update' });
                await FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'do-not-update',
                    profilePictureUrl: 'remove',
                    notificationSubscriptions: 'do-not-update'
                });

                const updated = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);
                expect(updated.properties.profilePictureUrl).toBeNull();
            });
        });

        describe('when updating notification subscriptions', () => {
            it('should set the subscriptions to the provided list', async () => {
                await FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'do-not-update',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: ['new-fine', 'fine-changed']
                });

                const updated = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);
                expect(updated.settings.notification.subscriptions).toBeEqual(['new-fine', 'fine-changed']);
            });
        });

        describe('when all fields are set to "do-not-update"', () => {
            it('should not change any user properties', async () => {
                const before = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);

                await FirebaseApp.shared.functions.user.update.execute({
                    name: 'do-not-update',
                    bio: 'do-not-update',
                    profilePictureUrl: 'do-not-update',
                    notificationSubscriptions: 'do-not-update'
                });

                const updated = User.builder.build((await FirebaseApp.shared.firestore.user(userId).snapshot()).data);
                expect(updated.properties.firstName).toBeEqual(before.properties.firstName);
                expect(updated.properties.lastName).toBeEqual(before.properties.lastName);
            });
        });
    });
});

