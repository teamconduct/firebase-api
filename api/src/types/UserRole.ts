import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization, localizations } from './Localization';

export type UserRole =
    | 'person-manager'
    | 'fineTemplate-manager'
    | 'fine-manager'
    | 'team-manager';

export namespace UserRole {

    export const all: UserRole[] = [
        'person-manager',
        'fineTemplate-manager',
        'fine-manager',
        'team-manager'
    ];

    export function formatted(role: UserRole): string {
        const localizationKeyMap: Record<UserRole, keyof (typeof localizations)[keyof typeof localizations]['userRole']> = {
            'person-manager': 'personManager',
            'fineTemplate-manager': 'fineTemplateManager',
            'fine-manager': 'fineManager',
            'team-manager': 'teamManager'
        }
        return Localization.shared.userRole[localizationKeyMap[role]].value();
    }

    export const builder = new ValueTypeBuilder<UserRole>();
}
