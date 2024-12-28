import { ArrayTypeBuilder, Dictionary, Flatten, ObjectTypeBuilder, TypeBuilder, UtcDate, ValueTypeBuilder } from 'firebase-function';
import { PersonNotificationProperties } from './PersonNotificationProperties';
import { UserId } from './User';
import { UserRole } from './UserRole';

export type PersonSignInProperties = {
    userId: UserId
    signInDate: UtcDate,
    notificationProperties: PersonNotificationProperties,
    roles: UserRole[]
}

export namespace PersonSignInProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonSignInProperties>, PersonSignInProperties>({
        userId: UserId.builder,
        signInDate: new TypeBuilder(UtcDate.decode),
        notificationProperties: PersonNotificationProperties.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    export function empty(userId: UserId): PersonSignInProperties {
        return {
            userId,
            signInDate: UtcDate.now,
            notificationProperties: {
                tokens: new Dictionary(),
                subscriptions: []
            },
            roles: []
        };
    }
}
