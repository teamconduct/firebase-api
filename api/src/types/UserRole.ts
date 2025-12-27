import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization, localizations } from './Localization';
import { Locale } from './Locale';

export type UserRole =
    | 'person-manager'
    | 'fineTemplate-manager'
    | 'fine-manager'
    | 'fine-can-add'
    | 'team-manager';

export namespace UserRole {

    export const all: UserRole[] = [
        'person-manager',
        'fineTemplate-manager',
        'fine-manager',
        'fine-can-add',
        'team-manager'
    ];

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

    export const builder = new ValueTypeBuilder<UserRole>();
}
