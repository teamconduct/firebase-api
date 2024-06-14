export type UserRole =
    | 'person-add'
    | 'person-update'
    | 'person-delete'
    | 'fineTemplate-add'
    | 'fineTemplate-update'
    | 'fineTemplate-delete'
    | 'fine-add'
    | 'fine-update'
    | 'fine-delete'
    | 'userRole-manager';

export namespace UserRole {
    export const all: UserRole[] = [
        'person-add',
        'person-update',
        'person-delete',
        'fineTemplate-add',
        'fineTemplate-update',
        'fineTemplate-delete',
        'fine-add',
        'fine-update',
        'fine-delete',
        'userRole-manager'
    ];
}
