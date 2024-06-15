import { ObjectTypeBuilder, Flatten, RecordTypeBuilder, ValueTypeBuilder, ArrayTypeBuilder } from 'firebase-function';

export type NotificationSubscription =
    | 'new-fine'
    | 'fine-reminder'
    | 'fine-state-change';

export type PersonNotificationProperties = {
    tokens: Record<string, string>,
    subscriptions: NotificationSubscription[]
};

export namespace PersonNotificationProperties {

    export const builder = new ObjectTypeBuilder<Flatten<PersonNotificationProperties>, PersonNotificationProperties>({
        tokens: new RecordTypeBuilder(new ValueTypeBuilder()),
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });
}
