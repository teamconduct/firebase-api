import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { InAppNotification } from '../../types';

export namespace NotificationMarkNotificationAsReadFunction {

    export type Parameters = {
        notificationId: InAppNotification.Id;
    };
}

export class NotificationMarkNotificationAsReadFunction implements FirebaseFunction<NotificationMarkNotificationAsReadFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<NotificationMarkNotificationAsReadFunction.Parameters>, NotificationMarkNotificationAsReadFunction.Parameters>({
        notificationId: InAppNotification.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
