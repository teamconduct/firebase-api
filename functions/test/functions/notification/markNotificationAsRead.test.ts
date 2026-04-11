import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User, InAppNotification } from '@stevenkellner/team-conduct-api';
import { Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('notification/markNotificationAsRead', () => {
    const notificationId = Tagged.generate('inAppNotification' as const);

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.notification.markNotificationAsRead.execute({ notificationId }),
                'unauthenticated',
                'User is not authenticated'
            );
        });
    });

    describe('given the user auth record does not exist in Firestore', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.auth.signIn();

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.notification.markNotificationAsRead.execute({ notificationId }),
                'permission-denied',
                'User authentication does not exist'
            );
        });
    });

    describe('given the notification does not exist', () => {
        it('should throw a not-found error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            const testUserId = RandomData.shared.userId();
            await FirebaseApp.shared.firestore.userAuth(authId).set({ userId: testUserId });

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.notification.markNotificationAsRead.execute({ notificationId }),
                'not-found',
                'Notification not found'
            );
        });
    });

    describe('given a valid authenticated user with an existing notification', () => {
        let testUserAuthId: UserAuthId;
        let userId: User.Id;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
            const authSnap = await FirebaseApp.shared.firestore.userAuth(testUserAuthId).snapshot();
            userId = User.Id.builder.build(authSnap.data.userId);

            const notification = new InAppNotification(
                notificationId,
                UtcDate.now,
                false,
                { type: 'team-kickout', teamId: FirebaseApp.shared.testTeam.id }
            );
            await FirebaseApp.shared.firestore.notification(userId, notificationId).set(notification);
        });

        it('should mark the notification as read', async () => {
            await FirebaseApp.shared.functions.notification.markNotificationAsRead.execute({ notificationId });

            const snapshot = await FirebaseApp.shared.firestore.notification(userId, notificationId).snapshot();
            const updated = InAppNotification.builder.build(snapshot.data);
            expect(updated.isRead).toBeTrue();
        });

        it('should not change other notification properties', async () => {
            await FirebaseApp.shared.functions.notification.markNotificationAsRead.execute({ notificationId });

            const snapshot = await FirebaseApp.shared.firestore.notification(userId, notificationId).snapshot();
            const updated = InAppNotification.builder.build(snapshot.data);
            expect(updated.id.guidString).toBeEqual(notificationId.guidString);
        });
    });
});