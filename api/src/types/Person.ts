import { PersonPrivateProperties } from './PersonPrivateProperties';
import { PersonSignInProperties } from './PersonSignInProperties';
import { Fine } from './Fine';
import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';

export class Person implements Flattable<Person.Flatten> {

    public constructor(
        public id: Person.Id,
        public properties: PersonPrivateProperties,
        public fineIds: Fine.Id[] = [],
        public signInProperties: PersonSignInProperties | null = null
    ) {}

    public get flatten(): Person.Flatten {
        return {
            id: this.id.flatten,
            properties: this.properties.flatten,
            fineIds: this.fineIds.map(fineId => fineId.flatten),
            signInProperties: this.signInProperties?.flatten ?? null
        };
    }

    public get name(): string {
        if (this.properties.lastName === null)
            return this.properties.firstName;
        return `${this.properties.firstName} ${this.properties.lastName}`;
    }
}

export namespace Person {

    export type Id = Tagged<Guid, 'person'>;

    export namespace Id {

        export type Flatten = string;

        export const builder = Tagged.builder('person' as const, Guid.builder);
    }

    export type Flatten = {
        id: Id.Flatten,
        properties: PersonPrivateProperties.Flatten,
        fineIds: Fine.Id.Flatten[],
        signInProperties: PersonSignInProperties.Flatten | null,
    }

    export class TypeBuilder implements ITypeBuilder<Flatten, Person> {

        public build(value: Flatten): Person {
            return new Person(
                Id.builder.build(value.id),
                PersonPrivateProperties.builder.build(value.properties),
                value.fineIds.map(fineId => Fine.Id.builder.build(fineId)),
                value.signInProperties ? PersonSignInProperties.builder.build(value.signInProperties) : null
            );
        }
    }

    export const builder = new TypeBuilder();
}
