import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';

/**
 * Represents a team in the system with its basic information.
 *
 * A team is a group of people who can track fines and payments together.
 * Teams can optionally have a PayPal.Me link for simplified payment collection.
 */
export class Team implements Flattable<Team.Flatten> {

    /**
     * Creates a new Team instance.
     * @param id - The unique identifier for this team
     * @param name - The display name of the team
     * @param paypalMeLink - Optional PayPal.Me link for payment collection (null if not set)
     */
    public constructor(
        public id: Team.Id,
        public name: string,
        public paypalMeLink: string | null
    ) {}

    /**
     * Gets the flattened representation of this team for serialization.
     */
    public get flatten(): Team.Flatten {
        return {
            id: this.id.flatten,
            name: this.name,
            paypalMeLink: this.paypalMeLink
        };
    }
}

export namespace Team {

    /**
     * Tagged type for team identifiers to prevent mixing with other GUID types.
     */
    export type Id = Tagged<Guid, 'team'>;

    export namespace Id {

        /**
         * Flattened representation of a team ID (plain GUID string).
         */
        export type Flatten = string;

        /**
         * Builder for constructing Team.Id instances from GUID strings.
         */
        export const builder = Tagged.builder('team' as const, Guid.builder);
    }

    /**
     * Flattened representation of a Team for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        name: string,
        paypalMeLink: string | null
    }

    /**
     * Builder for constructing Team instances from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, Team> {

        /**
         * Builds a Team instance from flattened data.
         * @param value - The flattened team data
         * @returns A new Team instance
         */
        public build(value: Flatten): Team {
            return new Team(
                Id.builder.build(value.id),
                value.name,
                value.paypalMeLink
            );
        }
    }

    /**
     * Singleton builder instance for Team.
     */
    export const builder = new TypeBuilder();
}
