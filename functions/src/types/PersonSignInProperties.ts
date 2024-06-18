import { Dictionary, Flatten, ObjectTypeBuilder, TypeBuilder, UtcDate } from 'firebase-function';
import { PersonNotificationProperties } from './PersonNotificationProperties';
import { UserId } from './User';

export type PersonSignInProperties = {
    userId: UserId
    signInDate: UtcDate,
    notificationProperties: PersonNotificationProperties
}

export namespace PersonSignInProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonSignInProperties>, PersonSignInProperties>({
        userId: UserId.builder,
        signInDate: new TypeBuilder(UtcDate.decode),
        notificationProperties: PersonNotificationProperties.builder
    });

    export function empty(userId: UserId): PersonSignInProperties {
        return {
            userId,
            signInDate: UtcDate.now,
            notificationProperties: {
                tokens: new Dictionary(),
                subscriptions: []
            }
        };
    }
}
