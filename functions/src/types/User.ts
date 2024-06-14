import { UserRole } from './UserRole';
import { ArrayTypeBuilder, Flatten, Guid, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type User = {
    teams: {
        id: Guid
        personId: Guid
        roles: UserRole[]
    }[]
}

export namespace User {
    export const builder = new ObjectTypeBuilder<Flatten<User>, User>({
        teams: new ArrayTypeBuilder(new ObjectTypeBuilder({
            id: new TypeBuilder(Guid.from),
            personId: new TypeBuilder(Guid.from),
            roles: new ArrayTypeBuilder(new ValueTypeBuilder())
        }))
    });
}
