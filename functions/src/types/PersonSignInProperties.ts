import { Flattable, ITypeBuilder, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { NotificationProperties } from './NotificationProperties';
import { User } from './User';
import { UserRole } from './UserRole';

export class PersonSignInProperties implements Flattable<PersonSignInProperties.Flatten> {

    public constructor(
        public userId: User.Id,
        public signInDate: UtcDate,
        public notificationProperties: NotificationProperties = new NotificationProperties(),
        public roles: UserRole[] = []
    ) {}

    public get flatten(): PersonSignInProperties.Flatten {
        return {
            userId: this.userId.flatten,
            signInDate: this.signInDate.flatten,
            notificationProperties: this.notificationProperties.flatten,
            roles: this.roles
        };
    }
}

export namespace PersonSignInProperties {

    export type Flatten = {
        userId: User.Id.Flatten
        signInDate: UtcDate.Flatten,
        notificationProperties: NotificationProperties.Flatten,
        roles: UserRole[]
    }

    export class TypeBuilder implements ITypeBuilder<Flatten, PersonSignInProperties> {

        public build(value: Flatten): PersonSignInProperties {
            return new PersonSignInProperties(User.Id.builder.build(value.userId), UtcDate.builder.build(value.signInDate), NotificationProperties.builder.build(value.notificationProperties), value.roles);
        }
    }

    export const builder = new TypeBuilder();
}
