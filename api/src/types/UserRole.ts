import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

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

    export const builder = new ValueTypeBuilder<UserRole>();
}
