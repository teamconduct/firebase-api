import { Flatten, ObjectTypeBuilder, TypeBuilder, UtcDate, ValueTypeBuilder } from 'firebase-function';
import { PersonNotificationProperties } from './PersonNotificationProperties';

export type PersonSignInProperties = {
    userId: string
    signInDate: UtcDate,
    notificationProperties: PersonNotificationProperties
}

export namespace PersonSignInProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonSignInProperties>, PersonSignInProperties>({
        userId: new ValueTypeBuilder(),
        signInDate: new TypeBuilder(UtcDate.decode),
        notificationProperties: PersonNotificationProperties.builder
    });

    export function empty(userId: string): PersonSignInProperties {
        return {
            userId,
            signInDate: UtcDate.now,
            notificationProperties: {
                tokens: {},
                subscriptions: []
            }
        };
    }
}
