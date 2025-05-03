import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class PersonPrivateProperties implements Flattable<PersonPrivateProperties.Flatten> {

    constructor(
        public firstName: string,
        public lastName: string | null
    ) {}

    public get flatten(): PersonPrivateProperties.Flatten {
        return {
            firstName: this.firstName,
            lastName: this.lastName
        };
    }
}

export namespace PersonPrivateProperties {

    export type Flatten = {
        firstName: string;
        lastName: string | null;
    }

    export class TypeBuilder implements ITypeBuilder<Flatten, PersonPrivateProperties> {

        public build(value: Flatten): PersonPrivateProperties {
            return new PersonPrivateProperties(
                value.firstName,
                value.lastName
            );
        }
    }

    export const builder = new TypeBuilder();
}

