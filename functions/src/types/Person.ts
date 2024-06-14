import { ArrayTypeBuilder, Flatten, Guid, ObjectTypeBuilder, OptionalTypeBuilder, TypeBuilder } from 'firebase-function';
import { PersonPrivateProperties } from './PersonPrivateProperties';
import { PersonSignInProperties } from './PersonSignInProperties';

export type Person = {
    id: Guid,
    properties: PersonPrivateProperties,
    fineIds: Guid[],
    signInProperties: PersonSignInProperties | null
}

export namespace Person {

    export const builder = new ObjectTypeBuilder<Flatten<Person>, Person>({
        id: new TypeBuilder(Guid.from),
        properties: PersonPrivateProperties.builder,
        fineIds: new ArrayTypeBuilder(new TypeBuilder(Guid.from)),
        signInProperties: new OptionalTypeBuilder(PersonSignInProperties.builder)
    });
}
