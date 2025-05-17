import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization, localizationKey } from './Localization';

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
        const localizationKeyMap: Record<UserRole, keyof typeof localizationKey.userRole> = {
            'person-manager': 'personManager',
            'fineTemplate-manager': 'fineTemplateManager',
            'fine-manager': 'fineManager',
            'team-manager': 'teamManager'
        }
        return Localization.shared.get(key => key.userRole[localizationKeyMap[role]]);
    }

    export const builder = new ValueTypeBuilder<UserRole>();
}
