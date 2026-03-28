import { Dictionary, Flattable, ITypeBuilder, Tagged, UtcDate, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Team } from './Team';
import { Person } from './Person';
import { NotificationProperties } from './NotificationProperties';

/**
 * Represents a user in the system with associated team memberships.
 *
 * A user can be a member of multiple teams, and for each team, they have
 * specific properties (team name and associated person ID).
 */
export class User implements Flattable<User.Flatten> {

    /**
     * Creates a new User instance.
     * @param id - The unique identifier for this user
     * @param teams - Dictionary mapping team IDs to team-specific user properties
     */
    public constructor(
        public id: User.Id,
        public signInDate: UtcDate,
        public signInType: User.SignInType,
        public properties: User.UserProperties,
        public settings: User.UserSettings,
        public teams: Dictionary<Team.Id, User.TeamProperties> = new Dictionary(Team.Id.builder)
    ) {}

    /**
     * Gets the flattened representation of this user for serialization.
     */
    public get flatten(): User.Flatten {
        return {
            id: this.id.flatten,
            signInDate: this.signInDate.flatten,
            signInType: this.signInType.flatten,
            properties: this.properties.flatten,
            settings: this.settings.flatten,
            teams: this.teams.flatten
        };
    }
}

export namespace User {

    /**
     * Tagged type for user identifiers to prevent mixing with other string IDs.
     */
    export type Id = Tagged<string, 'user'>;

    export namespace Id {

        /**
         * Flattened representation of a user ID (plain string).
         */
        export type Flatten = string;

        /**
         * Builder for constructing User.Id instances from strings.
         */
        export const builder = Tagged.builder('user' as const, new ValueTypeBuilder<string>());
    }

    /**
     * Represents email-based authentication sign-in type.
     *
     * Used when a user signs in using their email address.
     */
    export class SignInTypeEmail implements Flattable<SignInTypeEmail.Flatten> {

        /**
         * Creates a new email sign-in type.
         * @param email - The email address used for authentication
         */
        public constructor(
            public email: string
        ) {}

        /**
         * Gets the flattened representation for serialization.
         */
        public get flatten(): SignInTypeEmail.Flatten {
            return {
                type: 'email',
                email: this.email
            };
        }
    }

    export namespace SignInTypeEmail {

        /**
         * Flattened representation of email sign-in type for serialization.
         */
        export type Flatten = {
            type: 'email',
            email: string
        };

        /**
         * Builder for constructing SignInTypeEmail instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, SignInTypeEmail> {

            /**
             * Builds a SignInTypeEmail instance from flattened data.
             * @param value - The flattened email sign-in type data
             * @returns A new SignInTypeEmail instance
             */
            public build(value: Flatten): SignInTypeEmail {
                return new SignInTypeEmail(value.email);
            }
        }

        /**
         * Singleton builder instance for SignInTypeEmail.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Represents OAuth-based authentication sign-in type.
     *
     * Used when a user signs in using an OAuth provider (Google or Apple).
     */
    export class SignInTypeOAuth implements Flattable<SignInTypeOAuth.Flatten> {

        /**
         * Creates a new OAuth sign-in type.
         * @param provider - The OAuth provider used for authentication ('google' or 'apple')
         */
        public constructor(
            public provider: 'google' | 'apple'
        ) {}

        /**
         * Gets the flattened representation for serialization.
         */
        public get flatten(): SignInTypeOAuth.Flatten {
            return {
                type: this.provider
            };
        }
    }

    export namespace SignInTypeOAuth {

        /**
         * Flattened representation of OAuth sign-in type for serialization.
         */
        export type Flatten = {
            type: 'google' | 'apple'
        };

        /**
         * Builder for constructing SignInTypeOAuth instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, SignInTypeOAuth> {

            /**
             * Builds a SignInTypeOAuth instance from flattened data.
             * @param value - The flattened OAuth sign-in type data
             * @returns A new SignInTypeOAuth instance
             */
            public build(value: Flatten): SignInTypeOAuth {
                return new SignInTypeOAuth(value.type);
            }
        }

        /**
         * Singleton builder instance for SignInTypeOAuth.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Union type representing any sign-in method.
     *
     * Can be either email-based or OAuth-based authentication.
     */
    export type SignInType = SignInTypeEmail | SignInTypeOAuth;

    export namespace SignInType {

        /**
         * Flattened representation of any sign-in type for serialization.
         */
        export type Flatten = SignInTypeEmail.Flatten | SignInTypeOAuth.Flatten;

        /**
         * Builder for constructing SignInType instances from flattened data.
         *
         * Automatically determines the correct type based on the 'type' field.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, SignInType> {

            /**
             * Builds a SignInType instance from flattened data.
             *
             * Routes to the appropriate builder based on the type field.
             * @param value - The flattened sign-in type data
             * @returns Either a SignInTypeEmail or SignInTypeOAuth instance
             */
            public build(value: Flatten): SignInType {
                if (value.type === 'email')
                    return SignInTypeEmail.builder.build(value);
                else
                    return SignInTypeOAuth.builder.build(value);
            }
        }

        /**
         * Singleton builder instance for SignInType.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Represents a user's name, bio, and profile picture URL.
     */
    export class UserProperties implements Flattable<UserProperties.Flatten> {

        /**
         * Creates a new UserProperties instance.
         * @param firstName - The user's first name
         * @param lastName - The user's last name
         * @param bio - The user's bio
         * @param profilePictureUrl - The URL of the user's profile picture
         */
        public constructor(
            public firstName: string,
            public lastName: string,
            public bio: string | null = null,
            public profilePictureUrl: string | null = null
        ) {}

        public get flatten(): UserProperties.Flatten {
            return {
                firstName: this.firstName,
                lastName: this.lastName,
                bio: this.bio,
                profilePictureUrl: this.profilePictureUrl
            };
        }
    }

    export namespace UserProperties {

        /**
         * Flattened representation of a user's properties for serialization.
         */
        export type Flatten = {
            firstName: string,
            lastName: string,
            bio: string | null,
            profilePictureUrl: string | null
        };

        /**
         * Builder for constructing UserProperties instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, UserProperties> {

            /**
             * Builds a UserProperties instance from flattened data.
             * @param value - The flattened user properties data
             * @returns A new UserProperties instance
             */
            public build(value: Flatten): UserProperties {
                return new UserProperties(value.firstName, value.lastName, value.bio, value.profilePictureUrl);
            }
        }

        /**
         * Singleton builder instance for UserProperties.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Properties that are specific to a user's membership in a particular team.
     */
    export class TeamProperties implements Flattable<TeamProperties.Flatten> {

        /**
         * Creates new team-specific user properties.
         * @param teamId - The ID of the team
         * @param teamName - The display name of the team
         * @param personId - The ID of the person associated with this user in this team
         */
        public constructor(
            public teamId: Team.Id,
            public teamName: string,
            public personId: Person.Id
        ) {}

        /**
         * Gets the flattened representation of these team properties.
         */
        public get flatten(): TeamProperties.Flatten {
            return {
                teamId: this.teamId.flatten,
                teamName: this.teamName,
                personId: this.personId.flatten
            };
        }
    }

    export namespace TeamProperties {

        /**
         * Flattened representation of team properties for serialization.
         */
        export type Flatten = {
            teamId: Team.Id.Flatten,
            teamName: string,
            personId: Person.Id.Flatten
        };

        /**
         * Builder for constructing TeamProperties from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, TeamProperties> {

            /**
             * Builds a TeamProperties instance from flattened data.
             * @param value - The flattened team properties data
             * @returns A new TeamProperties instance
             */
            public build(value: Flatten): TeamProperties {
                return new TeamProperties(Team.Id.builder.build(value.teamId), value.teamName, Person.Id.builder.build(value.personId));
            }
        }

        /**
         * Singleton builder instance for TeamProperties.
         */
        export const builder = new TypeBuilder();
    }

    export class UserSettings implements Flattable<UserSettings.Flatten> {

        public constructor(
            public notification: NotificationProperties,
            public twoFactorAuthEnabled: boolean
        ) {}

        /**
         * Gets the flattened representation of these user settings for serialization.
         */
        public get flatten(): UserSettings.Flatten {
            return {
                notification: this.notification.flatten,
                twoFactorAuthEnabled: this.twoFactorAuthEnabled
            };
        }
    }

    export namespace UserSettings {

        /**
         * Flattened representation of user settings for serialization.
         */
        export type Flatten = {
            notification: NotificationProperties.Flatten,
            twoFactorAuthEnabled: boolean
        };

        /**
         * Builder for constructing UserSettings instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, UserSettings> {

            /**
             * Builds a UserSettings instance from flattened data.
             * @param value - The flattened user settings data
             * @returns A new UserSettings instance
             */
            public build(value: Flatten): UserSettings {
                return new UserSettings(NotificationProperties.builder.build(value.notification), value.twoFactorAuthEnabled);
            }
        }

        /**
         * Singleton builder instance for UserSettings.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Flattened representation of a User for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        signInDate: string,
        signInType: SignInType.Flatten,
        properties: UserProperties.Flatten,
        settings: UserSettings.Flatten,
        teams: Dictionary.Flatten<TeamProperties>
    }

    /**
     * Builder for constructing User instances from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, User> {

        /**
         * Builds a User instance from flattened data.
         * @param value - The flattened user data
         * @returns A new User instance with all teams reconstructed
         */
        public build(value: Flatten): User {
            return new User(Id.builder.build(value.id), UtcDate.builder.build(value.signInDate), SignInType.builder.build(value.signInType), User.UserProperties.builder.build(value.properties), User.UserSettings.builder.build(value.settings), Dictionary.builder(Team.Id.builder, User.TeamProperties.builder).build(value.teams));
        }
    }

    /**
     * Singleton builder instance for User.
     */
    export const builder = new TypeBuilder();
}
