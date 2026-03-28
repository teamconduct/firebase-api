import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';
import { Locale } from './Locale';
import { Currency } from './Currency';

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
        public teamLogoUrl: string | null,
        public teamSportCategory: string | null,
        public teamDescription: string | null,
        public settings: Team.TeamSettings
    ) {}

    /**
     * Gets the flattened representation of this team for serialization.
     */
    public get flatten(): Team.Flatten {
        return {
            id: this.id.flatten,
            name: this.name,
            teamLogoUrl: this.teamLogoUrl,
            teamSportCategory: this.teamSportCategory,
            teamDescription: this.teamDescription,
            settings: this.settings.flatten
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

    export class TeamSettings implements Flattable<TeamSettings.Flatten> {

        public constructor(
            public paypalMeLink: string | null,
            public allowMembersToAddFines: boolean,
            public fineVisibility: TeamSettings.FineVisibility,
            public joinRequestType: TeamSettings.JoinRequestType,
            public currency: Currency,
            public locale: Locale
        ) {}

        public get flatten(): TeamSettings.Flatten {
            return {
                paypalMeLink: this.paypalMeLink,
                allowMembersToAddFines: this.allowMembersToAddFines,
                fineVisibility: this.fineVisibility,
                joinRequestType: this.joinRequestType,
                currency: this.currency,
                locale: this.locale

            };
        }
    }

    export namespace TeamSettings {

        export type FineVisibility = 'only-own-fines' | 'all-fines';

        export type JoinRequestType = 'public-link-without-approval' | 'public-link-with-approval' | 'invite-only';

         /**
         * Flattened representation of team settings for serialization.
         */
        export type Flatten = {
            paypalMeLink: string | null,
            allowMembersToAddFines: boolean,
            fineVisibility: FineVisibility,
            joinRequestType: JoinRequestType,
            currency: Currency,
            locale: Locale
        }

        /**
         * Builder for constructing TeamSettings instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, TeamSettings> {

            /**
             * Builds a TeamSettings instance from flattened data.
             * @param value - The flattened team settings data
             * @returns A new TeamSettings instance
             */
            public build(value: Flatten): TeamSettings {
                return new TeamSettings(
                    value.paypalMeLink,
                    value.allowMembersToAddFines,
                    value.fineVisibility,
                    value.joinRequestType,
                    value.currency,
                    value.locale
                );
            }
        }

        /**
         * Singleton builder instance for TeamSettings.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Flattened representation of a Team for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        name: string,
        teamLogoUrl: string | null,
        teamSportCategory: string | null,
        teamDescription: string | null,
        settings: TeamSettings.Flatten
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
                value.teamLogoUrl,
                value.teamSportCategory,
                value.teamDescription,
                TeamSettings.builder.build(value.settings)
            );
        }
    }

    /**
     * Singleton builder instance for Team.
     */
    export const builder = new TypeBuilder();
}
