import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class Configuration implements Flattable<Configuration.Flatten> {

    public constructor(
        public currency: Configuration.Currency,
        public locale: Configuration.Locale
    ) {}

    public get flatten(): Configuration.Flatten {
        return {
            currency: this.currency,
            locale: this.locale
        };
    }
}

export namespace Configuration {

    export type Currency = 'EUR' | 'USD';

    export type Locale = 'de' | 'en';

    export namespace Locale {

        export const all: Locale[] = ['de', 'en'];
    }

    export type Flatten = {
        currency: Currency,
        locale: Locale
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, Configuration> {

        public build(flatten: Flatten): Configuration {
            return new Configuration(
                flatten.currency,
                flatten.locale
            );
        }
    }

    export const builder = new TypeBuilder();
}