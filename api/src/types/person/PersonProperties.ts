import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

/**
 * Represents the personal properties of a person within a team.
 *
 * Contains identification information such as first and last name.
 */
export class PersonProperties implements Flattable<PersonProperties.Flatten> {

    /**
     * Creates new person properties.
     *
     * @param firstName - The first name of the person
     * @param lastName - The last name of the person (null if not provided)
     */
    constructor(
        public firstName: string,
        public lastName: string
    ) {}

    /**
     * Gets the flattened representation of these properties for serialization.
     */
    public get flatten(): PersonProperties.Flatten {
        return {
            firstName: this.firstName,
            lastName: this.lastName
        };
    }
}

export namespace PersonProperties {

    /**
     * Flattened representation of person properties for serialization.
     */
    export type Flatten = {
        firstName: string;
        lastName: string;
    }

    /**
     * Builder for constructing PersonProperties from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, PersonProperties> {

        /**
         * Builds a PersonProperties instance from flattened data.
         *
         * @param value - The flattened person properties data
         * @returns A new PersonProperties instance
         */
        public build(value: Flatten): PersonProperties {
            return new PersonProperties(
                value.firstName,
                value.lastName
            );
        }
    }

    /**
     * Singleton builder instance for PersonProperties.
     */
    export const builder = new TypeBuilder();
}
