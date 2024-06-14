import { UserRole } from './UserRole';
import { ArrayTypeBuilder, Flatten, Guid, ObjectTypeBuilder, RecordTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type User = {
    teams: Record<string, {
        personId: Guid
        roles: UserRole[]
    }>
}

export namespace User {
    export const builder = new ObjectTypeBuilder<Flatten<User>, User>({
        teams: new RecordTypeBuilder(new ObjectTypeBuilder({
            personId: new TypeBuilder(Guid.from),
            roles: new ArrayTypeBuilder(new ValueTypeBuilder())
        }))
    });
}
