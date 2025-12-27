import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Currency } from './Currency';
import { Locale } from './Locale';

/**
 * Represents the configuration settings that will be passed to the functions parameters.
 * Contains currency and locale preferences.
 */
export class Configuration implements Flattable<Configuration.Flatten> {

    /**
     * Creates a new Configuration instance.
     * @param currency - The currency to use for monetary values (EUR, USD, ...)
     * @param locale - The locale for localization (language/region)
     */
    public constructor(
        public currency: Currency,
        public locale: Locale
    ) {}

    /**
     * Returns the flattened representation of the configuration.
     * @returns The flattened configuration object
     */
    public get flatten(): Configuration.Flatten {
        return {
            currency: this.currency,
            locale: this.locale
        };
    }
}

export namespace Configuration {

    /**
     * Flattened representation of Configuration for serialization.
     */
    export type Flatten = {
        currency: Currency,
        locale: Locale
    };

    /**
     * TypeBuilder for constructing Configuration instances from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, Configuration> {

        /**
         * Builds a Configuration instance from flattened data.
         * @param flatten - The flattened configuration data
         * @returns A new Configuration instance
         */
        public build(flatten: Flatten): Configuration {
            return new Configuration(
                flatten.currency,
                flatten.locale
            );
        }
    }

    /**
     * Singleton builder instance for Configuration.
     */
    export const builder = new TypeBuilder();
}
