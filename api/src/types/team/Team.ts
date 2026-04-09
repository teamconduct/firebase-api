import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';
import { Locale } from '../localization/Locale';
import { Currency } from '../Currency';

/**
 * Represents a team in the system with its basic information.
 *
 * A team is a group of people who can track fines and payments together.
 */
export class Team implements Flattable<Team.Flatten> {

    /**
     * Creates a new Team instance.
     *
     * @param id - The unique identifier for this team
     * @param name - The display name of the team
     * @param logoUrl - Optional URL for the team's logo (null if not set)
     * @param sportCategory - Optional sport category label (null if not set)
     * @param description - Optional description of the team (null if not set)
     * @param settings - Team configuration settings
     */
    public constructor(
        public id: Team.Id,
        public name: string,
        public logoUrl: string | null,
        public sportCategory: string | null,
        public description: string | null,
        public settings: Team.Settings
    ) {}

    /**
     * Gets the flattened representation of this team for serialization.
     */
    public get flatten(): Team.Flatten {
        return {
            id: this.id.flatten,
            name: this.name,
            logoUrl: this.logoUrl,
            sportCategory: this.sportCategory,
            description: this.description,
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

    /**
     * Configurable settings for a team.
     */
    export class Settings implements Flattable<Settings.Flatten> {

        /**
         * Creates new team settings.
         *
         * @param paypalMeLink - Optional PayPal.Me link for payment collection (null if not set)
         * @param allowMembersToAddFines - Whether regular members can add fines
         * @param fineVisibility - Controls which fines are visible to members
         * @param joinRequestType - Controls how new members can join the team
         * @param currency - The currency used for monetary fines
         * @param locale - The locale for localized output
         */
        public constructor(
            public paypalMeLink: string | null,
            public allowMembersToAddFines: boolean,
            public fineVisibility: Settings.FineVisibility,
            public joinRequestType: Settings.JoinRequestType,
            public currency: Currency,
            public locale: Locale
        ) {}

        /**
         * Gets the flattened representation of these settings for serialization.
         */
        public get flatten(): Settings.Flatten {
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

    export namespace Settings {

        /**
         * Controls which fines are visible to team members.
         *
         * - 'only-own-fines': Members can only see their own fines
         * - 'all-fines': Members can see all fines in the team
         */
        export type FineVisibility = 'only-own-fines' | 'all-fines';

        /**
         * Controls how new members can join the team.
         *
         * - 'public-link-without-approval': Anyone with the link can join directly
         * - 'public-link-with-approval': Anyone with the link can request to join (requires approval)
         * - 'invite-only': Only invited people can join
         */
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
         * Builder for constructing Settings instances from flattened data.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, Settings> {

            /**
             * Builds a Settings instance from flattened data.
             *
             * @param value - The flattened team settings data
             * @returns A new Settings instance
             */
            public build(value: Flatten): Settings {
                return new Settings(
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
         * Singleton builder instance for Settings.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Flattened representation of a Team for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        name: string,
        logoUrl: string | null,
        sportCategory: string | null,
        description: string | null,
        settings: Settings.Flatten
    }

    /**
     * Builder for constructing Team instances from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, Team> {

        /**
         * Builds a Team instance from flattened data.
         *
         * @param value - The flattened team data
         * @returns A new Team instance
         */
        public build(value: Flatten): Team {
            return new Team(
                Id.builder.build(value.id),
                value.name,
                value.logoUrl,
                value.sportCategory,
                value.description,
                Settings.builder.build(value.settings)
            );
        }
    }

    /**
     * Singleton builder instance for Team.
     */
    export const builder = new TypeBuilder();
}
