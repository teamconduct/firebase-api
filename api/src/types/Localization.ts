import { mapRecord } from '@stevenkellner/typescript-common-functionality';
import { localizationEN } from '../locales/en';
import { localizationDE } from '../locales/de';
import { Pluralization } from './Pluralization';
import { Locale } from './Locale';

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
     * @param locale - The locale to retrieve localizations for
     * @returns The complete localization structure with type-safe access
     */
    public static shared(locale: Locale): SubLocalization<LocalizationDict> {
        return Localization.mapSubLocalization(localizations[locale]);
    }

    /**
     * Recursively maps raw localization data to localization class instances.
     * @param localization - The raw localization value to transform
     * @returns The transformed localization with proper class instances
     */
    private static mapSubLocalization<T extends SubLocalizationType>(localization: T): SubLocalization<T> {
        if (typeof localization === 'object' && ! (localization instanceof Pluralization))
            return mapRecord(localization as Record<string, SubLocalizationType>, subLocalization => Localization.mapSubLocalization(subLocalization)) as SubLocalization<T>;
        if (typeof localization === 'string')
            return new ValueLocalization(localization) as SubLocalization<T>;
        if (localization instanceof Pluralization)
            return new PluralLocalization(localization) as SubLocalization<T>;
        throw new Error('Invalid localization structure');
    }
}

/**
 * Handles localization strings with template variable substitution.
 * Supports {{variableName}} syntax for runtime value replacement.
 */
export class ValueLocalization {

    /**
     * Creates a new ValueLocalization instance.
     * @param rawValue - The template string with {{variable}} placeholders
     */
    constructor(private readonly rawValue: string) {}

    /**
     * Returns the localized string with variables substituted.
     * Template variables in the format {{key}} are replaced with provided argument values.
     * @param args - Record of variable names to their replacement values
     * @returns The localized string with all variables replaced
     * @throws Error if a required template variable is not provided in args
     */
    public value(args: Record<string, string> = {}): string {
        let rawValue = this.rawValue;
        const regex = /\{\{(?<key>.*?)\}\}/;
        while (true) {
            const match = regex.exec(rawValue);
            if (!match)
                break;
            const key = match.groups!.key;
            if (!(key in args))
                throw new Error(`Missing argument for key: ${key}`);
            rawValue = rawValue.replace(match[0], args[key]);
        }
        return rawValue;
    }
}

/**
 * Handles pluralized localization strings that vary based on count.
 * Combines Pluralization logic with template variable substitution.
 */
export class PluralLocalization {

    /**
     * Creates a new PluralLocalization instance.
     * @param pluralization - The Pluralization instance containing plural forms
     */
    constructor(private readonly pluralization: Pluralization) {}

    /**
     * Returns the appropriate pluralized string for the given count with variables substituted.
     * Automatically includes 'count' in the template variables.
     * @param count - The count to determine which plural form to use
     * @param args - Additional template variables to substitute (count is added automatically)
     * @returns The localized plural string with all variables replaced
     */
    public value(count: number, args: Record<string, string> = {}): string {
        const valueLocalization = new ValueLocalization(this.pluralization.get(count));
        return valueLocalization.value({
            count: `${count}`,
            ...args
        });
    }
}
