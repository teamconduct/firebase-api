import { Flattable, ITypeBuilder, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { NotificationProperties } from './NotificationProperties';
import { User } from './User';
import { UserRole } from './UserRole';

/**
 * Represents the sign-in properties for a person in the system.
 *
 * Contains authentication-related information including user ID, sign-in timestamp,
 * notification preferences, and assigned user roles for access control.
 */
export class PersonSignInProperties implements Flattable<PersonSignInProperties.Flatten> {

    /**
     * Creates new person sign-in properties.
     * @param userId - The unique identifier of the user associated with this person
     * @param joinDate - The timestamp when the person joined the team
     * @param notificationProperties - Optional notification preferences (defaults to new NotificationProperties)
     * @param roles - Optional array of user roles for access control (defaults to empty array)
     */
    public constructor(
        public userId: User.Id,
        public joinDate: UtcDate,
        public notificationProperties: NotificationProperties = new NotificationProperties(),
        public roles: UserRole[] = []
    ) {}

    /**
     * Gets the flattened representation of these sign-in properties for serialization.
     */
    public get flatten(): PersonSignInProperties.Flatten {
        return {
            userId: this.userId.flatten,
            joinDate: this.joinDate.flatten,
            notificationProperties: this.notificationProperties.flatten,
            roles: this.roles
        };
    }
}

export namespace PersonSignInProperties {

    /**
     * Flattened representation of person sign-in properties for serialization.
     */
    export type Flatten = {
        userId: User.Id.Flatten
        joinDate: UtcDate.Flatten,
        notificationProperties: NotificationProperties.Flatten,
        roles: UserRole[]
    }

    /**
     * Builder for constructing PersonSignInProperties from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, PersonSignInProperties> {

        /**
         * Builds a PersonSignInProperties instance from flattened data.
         * @param value - The flattened sign-in properties data
         * @returns A new PersonSignInProperties instance
         */
        public build(value: Flatten): PersonSignInProperties {
            return new PersonSignInProperties(User.Id.builder.build(value.userId), UtcDate.builder.build(value.joinDate), NotificationProperties.builder.build(value.notificationProperties), value.roles);
        }
    }

    /**
     * Singleton builder instance for PersonSignInProperties.
     */
    export const builder = new TypeBuilder();
}
