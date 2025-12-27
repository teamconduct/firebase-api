import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization, localizations } from './Localization';
import { Locale } from './Locale';

/**
 * Array of all available user roles.
 */
const userRoles = [
    'person-manager',       // Can manage persons, i.e. add/edit/remove persons of the team
    'fineTemplate-manager', // Can manage fine templates, i.e. add/edit/remove fine templates
    'fine-manager',         // Can manage fines, i.e. add/edit/remove fines
    'fine-can-add',         // Can add fines, but not edit or remove them
    'team-manager'          // Can manage team settings, i.e. invite/remove team members, change team name, etc.
] as const;

/**
 * Represents user roles in the application.
 * Defines different levels of permissions for team members.
 */
export type UserRole = typeof userRoles[number];

export namespace UserRole {
    /**
     * Array of all available user roles.
     */
    export const all: readonly UserRole[] = userRoles;

    /**
     * Returns the localized, human-readable name for a user role.
     * @param role - The user role to format
     * @param locale - The locale to use for localization
     * @returns The localized role name
     */
    export function formatted(role: UserRole, locale: Locale): string {
        const localizationKeyMap: Record<UserRole, keyof (typeof localizations)[keyof typeof localizations]['userRole']> = {
            'person-manager': 'personManager',
            'fineTemplate-manager': 'fineTemplateManager',
            'fine-manager': 'fineManager',
            'fine-can-add': 'fineCanAdd',
            'team-manager': 'teamManager'
        }
        return Localization.shared(locale).userRole[localizationKeyMap[role]].value();
    }

    /**
     * Builder for constructing UserRole values.
     */
    export const builder = new ValueTypeBuilder<UserRole>();
}
