import { PersonPrivateProperties } from './PersonPrivateProperties';
import { PersonSignInProperties } from './PersonSignInProperties';
import { Fine } from './Fine';
import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';

/**
 * Represents a person within a team, including their personal details, assigned fines, and optional sign-in properties.
 *
 * A person can have multiple fines assigned to them and may or may not be signed in (have sign-in properties).
 */
export class Person implements Flattable<Person.Flatten> {

    /**
     * Creates a new Person instance.
     *
     * @param id - Unique identifier for the person (GUID)
     * @param properties - Private properties including first name and optional last name
     * @param fineIds - Array of fine IDs assigned to this person (defaults to empty array)
     * @param signInProperties - Optional sign-in properties if the person has signed in (defaults to null)
     */
    public constructor(
        public id: Person.Id,
        public properties: PersonPrivateProperties,
        public fineIds: Fine.Id[] = [],
        public signInProperties: PersonSignInProperties | null = null
    ) {}

    /**
     * Returns the flattened representation of the person for serialization.
     */
    public get flatten(): Person.Flatten {
        return {
            id: this.id.flatten,
            properties: this.properties.flatten,
            fineIds: this.fineIds.map(fineId => fineId.flatten),
            signInProperties: this.signInProperties?.flatten ?? null
        };
    }

    /**
     * Returns the person's full name.
     *
     * If lastName is null, returns only firstName. Otherwise returns "firstName lastName".
     */
    public get name(): string {
        if (this.properties.lastName === null)
            return this.properties.firstName;
        return `${this.properties.firstName} ${this.properties.lastName}`;
    }
}

export namespace Person {

    /**
     * Tagged GUID type for person identifiers.
     */
    export type Id = Tagged<Guid, 'person'>;

    export namespace Id {

        /**
         * Flattened representation of a person ID (GUID string).
         */
        export type Flatten = string;

        /**
         * Type builder for Person.Id serialization/deserialization.
         */
        export const builder = Tagged.builder('person' as const, Guid.builder);
    }

    /**
     * Flattened representation of a Person for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        properties: PersonPrivateProperties.Flatten,
        fineIds: Fine.Id.Flatten[],
        signInProperties: PersonSignInProperties.Flatten | null,
    }

    /**
     * Type builder for Person serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, Person> {

        /**
         * Builds a Person instance from flattened data.
         *
         * @param value - Flattened person data
         * @returns Person instance
         */
        public build(value: Flatten): Person {
            return new Person(
                Id.builder.build(value.id),
                PersonPrivateProperties.builder.build(value.properties),
                value.fineIds.map(fineId => Fine.Id.builder.build(fineId)),
                value.signInProperties ? PersonSignInProperties.builder.build(value.signInProperties) : null
            );
        }
    }

    /**
     * Singleton instance of TypeBuilder for Person.
     */
    export const builder = new TypeBuilder();
}
