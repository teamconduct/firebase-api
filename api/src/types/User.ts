import { Dictionary, Flattable, ITypeBuilder, Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Team } from './Team';
import { Person } from './Person';

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
        public teams: Dictionary<Team.Id, User.TeamProperties> = new Dictionary(Team.Id.builder)
    ) {}

    /**
     * Gets the flattened representation of this user for serialization.
     */
    public get flatten(): User.Flatten {
        return {
            id: this.id.flatten,
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

    /**
     * Flattened representation of a User for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
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
            return new User(Id.builder.build(value.id), Dictionary.builder(Team.Id.builder, User.TeamProperties.builder).build(value.teams));
        }
    }

    /**
     * Singleton builder instance for User.
     */
    export const builder = new TypeBuilder();
}
