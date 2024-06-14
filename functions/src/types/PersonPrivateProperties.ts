import { Flatten, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type PersonPrivateProperties = {
    firstName: string
    lastName: string | null
}

export namespace PersonPrivateProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonPrivateProperties>, PersonPrivateProperties>({
        firstName: new ValueTypeBuilder(),
        lastName: new ValueTypeBuilder()
    });
}
