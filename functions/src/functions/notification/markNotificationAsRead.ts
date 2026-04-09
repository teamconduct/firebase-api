import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { InAppNotification, NotificationMarkNotificationAsReadFunction, User } from '@stevenkellner/team-conduct-api';
import { Firestore } from '../../firebase';

export class NotificationMarkNotificationAsReadExecutableFunction extends NotificationMarkNotificationAsReadFunction implements ExecutableFirebaseFunction<NotificationMarkNotificationAsReadFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: NotificationMarkNotificationAsReadFunction.Parameters): Promise<void> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated');

        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (!userAuthSnapshot.exists)
            throw new FunctionsError('permission-denied', 'User authentication does not exist');
        const userId = User.Id.builder.build(userAuthSnapshot.data.userId);

        const notificationSnapshot = await Firestore.shared.notification(userId, parameters.notificationId).snapshot();
        if (!notificationSnapshot.exists)
            throw new FunctionsError('not-found', 'Notification not found');
        const notification = InAppNotification.builder.build(notificationSnapshot.data);

        notification.isRead = true;
        await Firestore.shared.notification(userId, parameters.notificationId).set(notification);
    }
}
