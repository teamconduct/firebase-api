import { PersonId } from './Person';
import { TeamId } from './Team';
import { Dictionary, DictionaryTypeBuilder, Flatten, Guid, ObjectTypeBuilder, Tagged, TaggedTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type UserId = Tagged<string, 'user'>;

export namespace UserId {
    export const builder = new TaggedTypeBuilder<string, UserId>('user', new ValueTypeBuilder());
}

export type User = {
    id: UserId,
    teams: Dictionary<TeamId, {
        name: string,
        personId: PersonId
    }>
}

export namespace User {
    export const builder = new ObjectTypeBuilder<Flatten<User>, User>({
        id: UserId.builder,
        teams: new DictionaryTypeBuilder(new ObjectTypeBuilder({
            name: new ValueTypeBuilder(),
            personId: new TaggedTypeBuilder<string, PersonId>('person', new TypeBuilder(Guid.from))
        }))
    });

    export function empty(id: UserId): User {
        return {
            id: id,
            teams: new Dictionary()
        };
    }
}
