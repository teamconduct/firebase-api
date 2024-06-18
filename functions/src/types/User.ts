import { PersonId } from './Person';
import { TeamId } from './Team';
import { UserRole } from './UserRole';
import { ArrayTypeBuilder, Dictionary, DictionaryTypeBuilder, Flatten, Guid, ObjectTypeBuilder, Tagged, TaggedTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type UserId = Tagged<string, 'user'>;

export namespace UserId {
    export const builder = new TaggedTypeBuilder<string, UserId>('user', new ValueTypeBuilder());
}

export type User = {
    teams: Dictionary<TeamId, {
        personId: PersonId
        roles: UserRole[]
    }>
}

export namespace User {
    export const builder = new ObjectTypeBuilder<Flatten<User>, User>({
        teams: new DictionaryTypeBuilder(new ObjectTypeBuilder({
            personId: new TaggedTypeBuilder<string, PersonId>('person', new TypeBuilder(Guid.from)),
            roles: new ArrayTypeBuilder(new ValueTypeBuilder())
        }))
    });

    export function empty(): User {
        return {
            teams: new Dictionary()
        };
    }
}
