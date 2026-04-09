import { mapRecord } from '@stevenkellner/typescript-common-functionality';
import { localizationEN } from '../../locales/en';
import { localizationDE } from '../../locales/de';
import { Pluralization } from './Pluralization';
import { Locale } from './Locale';
import { ValueLocalization } from './ValueLocalization';
import { PluralLocalization } from './PluralLocalization';

/**
 * Type representing the structure of a localization dictionary.
 * Derived from the English localization as the base template.
 */
export type LocalizationDict = typeof localizationEN;

/**
 * Helper function to ensure a record satisfies the localization structure
 * while preserving its concrete type.
 */
const satisfiesLocalizationRecord = <T extends Record<string, LocalizationDict>>(value: T): T => value;

/**
 * Record of all available localizations keyed by locale.
 * Each localization must match the structure of LocalizationDict.
 */
export const localizations = satisfiesLocalizationRecord({
    en: localizationEN,
    de: localizationDE
});

/**
 * Recursive type definition for localization values.
 * Can be nested objects, strings with template variables, or Pluralization instances.
 */
export type SubLocalizationType = { [Key in string]: SubLocalizationType } | string | Pluralization;

/**
 * Mapped type that transforms SubLocalizationType into corresponding localization classes.
 * - Objects become nested SubLocalization structures
 * - Strings become ValueLocalization instances
 * - Pluralization instances become PluralLocalization instances
 */
export type SubLocalization<T extends SubLocalizationType> =
    T extends { [Key in string]: SubLocalizationType } ? { [Key in keyof T]: SubLocalization<T[Key]> } :
        T extends string ? ValueLocalization :
        T extends Pluralization ? PluralLocalization : never;

/**
 * Main localization class that provides access to localized strings.
 * Transforms raw localization data into type-safe localization objects.
 */
export class Localization {

    /**
     * Returns the localization structure for the specified locale.
     * Transforms the raw localization data into ValueLocalization and PluralLocalization instances.
     *
     * @param locale - The locale to retrieve localizations for
     * @returns The complete localization structure with type-safe access
     */
    public static shared(locale: Locale): SubLocalization<LocalizationDict> {
        return Localization.mapSubLocalization(localizations[locale]);
    }

    /**
     * Recursively maps raw localization data to localization class instances.
     *
     * @param localization - The raw localization value to transform
     * @returns The transformed localization with proper class instances
     */
    private static mapSubLocalization<T extends SubLocalizationType>(localization: T): SubLocalization<T> {
        if (typeof localization === 'object' && !(localization instanceof Pluralization))
            return mapRecord(localization as Record<string, SubLocalizationType>, subLocalization => Localization.mapSubLocalization(subLocalization)) as SubLocalization<T>;
        if (typeof localization === 'string')
            return new ValueLocalization(localization) as SubLocalization<T>;
        if (localization instanceof Pluralization)
            return new PluralLocalization(localization) as SubLocalization<T>;
        throw new Error('Invalid localization structure');
    }
}


