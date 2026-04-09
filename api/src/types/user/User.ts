import { Dictionary, Flattable, ITypeBuilder, Tagged, UtcDate, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Team } from '../team/Team';
import { Person } from '../person/Person';
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
     *
     * @param id - The unique identifier for this user
     * @param signInDate - The date when the user signed in
     * @param signInType - The authentication method used
     * @param properties - The user's profile properties
     * @param settings - The user's app settings
     * @param teams - Dictionary mapping team IDs to team-specific user properties
     */
    public constructor(
        public id: User.Id,
        public signInDate: UtcDate,
        public signInType: User.SignInType,
        public properties: User.Properties,
        public settings: User.Settings,
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
     * Union type representing any sign-in method.
     *
     * Can be either email-based or OAuth-based authentication.
     */
    export type SignInType = SignInType.Email | SignInType.OAuth;

    export namespace SignInType {

        /**
         * Represents email-based authentication sign-in type.
         *
         * Used when a user signs in using their email address.
         */
        export class Email implements Flattable<Email.Flatten> {

            /**
             * Creates a new email sign-in type.
             *
             * @param email - The email address used for authentication
             */
            public constructor(
                public email: string
            ) {}

            /**
             * Gets the flattened representation for serialization.
             */
            public get flatten(): Email.Flatten {
                return {
                    type: 'email',
                    email: this.email
                };
            }
        }

        export namespace Email {

            /**
             * Flattened representation of email sign-in type for serialization.
             */
            export type Flatten = {
                type: 'email',
                email: string
            };

            /**
             * Builder for constructing Email instances from flattened data.
             */
            export class TypeBuilder implements ITypeBuilder<Flatten, Email> {

                /**
                 * Builds an Email instance from flattened data.
                 *
                 * @param value - The flattened email sign-in type data
                 * @returns A new Email instance
                 */
                public build(value: Flatten): Email {
                    return new Email(value.email);
                }
            }

            /**
             * Singleton builder instance for Email.
             */
            export const builder = new TypeBuilder();
        }

        /**
         * Represents OAuth-based authentication sign-in type.
         *
         * Used when a user signs in using an OAuth provider (Google or Apple).
         */
        export class OAuth implements Flattable<OAuth.Flatten> {

            /**
             * Creates a new OAuth sign-in type.
             *
             * @param provider - The OAuth provider used for authentication ('google' or 'apple')
             */
            public constructor(
                public provider: 'google' | 'apple'
            ) {}

            /**
             * Gets the flattened representation for serialization.
             */
            public get flatten(): OAuth.Flatten {
                return {
                    type: this.provider
                };
            }
        }

        export namespace OAuth {

            /**
             * Flattened representation of OAuth sign-in type for serialization.
             */
            export type Flatten = {
                type: 'google' | 'apple'
            };

            /**
             * Builder for constructing OAuth instances from flattened data.
             */
            export class TypeBuilder implements ITypeBuilder<Flatten, OAuth> {

                /**
                 * Builds an OAuth instance from flattened data.
                 *
                 * @param value - The flattened OAuth sign-in type data
                 * @returns A new OAuth instance
                 */
                public build(value: Flatten): OAuth {
                    return new OAuth(value.type);
                }
            }

            /**
             * Singleton builder instance for OAuth.
             */
            export const builder = new TypeBuilder();
        }

        /**
         * Flattened representation of any sign-in type for serialization.
         */
        export type Flatten = Email.Flatten | OAuth.Flatten;

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
             *
             * @param value - The flattened sign-in type data
             * @returns Either an Email or OAuth instance
             */
            public build(value: Flatten): SignInType {
                if (value.type === 'email')
                    return Email.builder.build(value);
                else
                    return OAuth.builder.build(value);
            }
        }

        /**
         * Singleton builder instance for SignInType.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Represents a user's profile information.
     */
    export class Properties implements Flattable<Properties.Flatten> {

        /**
         * Creates a new Properties instance.
         *
         * @param firstName - The user's first name
         * @param lastName - The user's last name
         * @param bio - The user's bio (null if not set)
         * @param profilePictureUrl - The URL of the user's profile picture (null if not set)
         */
        public constructor(
            public firstName: string,
            public lastName: string,
            public bio: string | null = null,
            public profilePictureUrl: string | null = null
        ) {}

        /**
         * Gets the flattened representation for serialization.
         */
        public get flatten(): Properties.Flatten {
            return {
                firstName: this.firstName,
                lastName: this.lastName,
                bio: this.bio,
                profilePictureUrl: this.profilePictureUrl
            };
        }
    }

    export namespace Properties {

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
         * Builder for constructing Properties instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, Properties> {

            /**
             * Builds a Properties instance from flattened data.
             *
             * @param value - The flattened user properties data
             * @returns A new Properties instance
             */
            public build(value: Flatten): Properties {
                return new Properties(value.firstName, value.lastName, value.bio, value.profilePictureUrl);
            }
        }

        /**
         * Singleton builder instance for Properties.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Properties specific to a user's membership in a particular team.
     */
    export class TeamProperties implements Flattable<TeamProperties.Flatten> {

        /**
         * Creates new team-specific user properties.
         *
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
             *
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

    /**
     * App-level settings for a user.
     */
    export class Settings implements Flattable<Settings.Flatten> {

        /**
         * Creates new user settings.
         *
         * @param notification - The user's notification preferences and device tokens
         */
        public constructor(
            public notification: NotificationProperties
        ) {}

        /**
         * Gets the flattened representation of these user settings for serialization.
         */
        public get flatten(): Settings.Flatten {
            return {
                notification: this.notification.flatten
            };
        }
    }

    export namespace Settings {

        /**
         * Flattened representation of user settings for serialization.
         */
        export type Flatten = {
            notification: NotificationProperties.Flatten
        };

        /**
         * Builder for constructing Settings instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, Settings> {

            /**
             * Builds a Settings instance from flattened data.
             *
             * @param value - The flattened user settings data
             * @returns A new Settings instance
             */
            public build(value: Flatten): Settings {
                return new Settings(NotificationProperties.builder.build(value.notification));
            }
        }

        /**
         * Singleton builder instance for Settings.
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
        properties: Properties.Flatten,
        settings: Settings.Flatten,
        teams: Dictionary.Flatten<TeamProperties>
    }

    /**
     * Builder for constructing User instances from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, User> {

        /**
         * Builds a User instance from flattened data.
         *
         * @param value - The flattened user data
         * @returns A new User instance with all teams reconstructed
         */
        public build(value: Flatten): User {
            return new User(
                Id.builder.build(value.id),
                UtcDate.builder.build(value.signInDate),
                SignInType.builder.build(value.signInType),
                Properties.builder.build(value.properties),
                Settings.builder.build(value.settings),
                Dictionary.builder(Team.Id.builder, User.TeamProperties.builder).build(value.teams)
            );
        }
    }

    /**
     * Singleton builder instance for User.
     */
    export const builder = new TypeBuilder();
}
