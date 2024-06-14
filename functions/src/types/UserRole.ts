export type UserRole =
    | 'person-add'
    | 'fineTemplate-add'
    | 'fine-add';

export namespace UserRole {
    export const all: UserRole[] = ['person-add', 'fineTemplate-add'];
}
