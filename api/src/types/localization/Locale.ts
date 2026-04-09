import { keys, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { localizations } from './Localization';

/**
 * Supported locale types, derived from available localizations.
 */
export type Locale = keyof typeof localizations;

export namespace Locale {

    /**
     * Array of all available locales.
     */
    export const all: Locale[] = keys(localizations);

    /**
     * Builder for constructing Locale values.
     */
    export const builder = new ValueTypeBuilder<Locale>();
}
