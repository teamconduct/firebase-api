export type UserRole =
    | 'person-add'
    | 'person-update'
    | 'person-delete'
    | 'fineTemplate-add'
    | 'fineTemplate-update'
    | 'fineTemplate-delete'
    | 'fine-add'
    | 'fine-update'
    | 'fine-delete';

export namespace UserRole {
    export const all: UserRole[] = ['person-add', 'fineTemplate-add'];
}
