import { ArrayTypeBuilder, Flatten, Guid, ObjectTypeBuilder, OptionalTypeBuilder, Tagged, TaggedTypeBuilder, TypeBuilder } from 'firebase-function';
import { PersonPrivateProperties } from './PersonPrivateProperties';
import { PersonSignInProperties } from './PersonSignInProperties';
import { FineId } from './Fine';

export type PersonId = Tagged<Guid, 'person'>;

export namespace PersonId {
    export const builder = new TaggedTypeBuilder<string, PersonId>('person', new TypeBuilder(Guid.from));
}

export type Person = {
    id: PersonId,
    properties: PersonPrivateProperties,
    fineIds: FineId[],
    signInProperties: PersonSignInProperties | null,
}

export namespace Person {

    export const builder = new ObjectTypeBuilder<Flatten<Person>, Person>({
        id: PersonId.builder,
        properties: PersonPrivateProperties.builder,
        fineIds: new ArrayTypeBuilder(FineId.builder),
        signInProperties: new OptionalTypeBuilder(PersonSignInProperties.builder)
    });
}
