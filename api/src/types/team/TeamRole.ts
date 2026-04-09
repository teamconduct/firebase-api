import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization, localizations } from '../localization/Localization';
import { Locale } from '../localization/Locale';

/**
 * Array of all available team roles.
 */
const teamRoles = [
    'person-manager',       // Can manage persons, i.e. add/edit/remove persons of the team
    'fineTemplate-manager', // Can manage fine templates, i.e. add/edit/remove fine templates
    'fine-manager',         // Can manage fines, i.e. add/edit/remove fines
    'fine-can-add',         // Can add fines, but not edit or remove them
    'team-manager'          // Can manage team settings, i.e. invite/remove team members, change team name, etc.
] as const;

/**
 * Represents team roles in the application.
 * Defines different levels of permissions for team members.
 */
export type TeamRole = typeof teamRoles[number];

export namespace TeamRole {

    /**
     * Array of all available team roles.
     */
    export const all: readonly TeamRole[] = teamRoles;

    /**
     * Returns the localized, human-readable name for a team role.
     *
     * @param role - The team role to format
     * @param locale - The locale to use for localization
     * @returns The localized role name
     */
    export function formatted(role: TeamRole, locale: Locale): string {
        const localizationKeyMap: Record<TeamRole, keyof (typeof localizations)[keyof typeof localizations]['teamRole']> = {
            'person-manager': 'personManager',
            'fineTemplate-manager': 'fineTemplateManager',
            'fine-manager': 'fineManager',
            'fine-can-add': 'fineCanAdd',
            'team-manager': 'teamManager'
        };
        return Localization.shared(locale).teamRole[localizationKeyMap[role]].value();
    }

    /**
     * Builder for constructing TeamRole values.
     */
    export const builder = new ValueTypeBuilder<TeamRole>();
}
