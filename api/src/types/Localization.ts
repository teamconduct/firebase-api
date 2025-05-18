import { keys, mapRecord, values } from '@stevenkellner/typescript-common-functionality';
import { localizationEN } from '../locales/en';
import { localizationDE } from '../locales/de';
import { Pluralization } from './Pluralization';

export const localizations = {
    en: localizationEN,
    de: localizationDE
};

export type SubLocalizationType = { [Key in string]: SubLocalizationType } | string | Pluralization;

export type SubLocalization<T extends SubLocalizationType> =
    T extends { [Key in string]: SubLocalizationType } ? { [Key in keyof T]: SubLocalization<T[Key]> } :
        T extends string ? ValueLocalization :
        T extends Pluralization ? PluralLocalization : never;

export class ValueLocalization {

    constructor(private readonly rawValues: Record<keyof typeof localizations, string>) {}

    public value(args: Record<string, string> = {}): string {
        let rawValue = this.rawValues[Localization.locale];
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

export class PluralLocalization {

    constructor(private readonly pluralizations: Record<keyof typeof localizations, Pluralization>) {}

    public value(count: number, args: Record<string, string> = {}): string {
        const valueLocalization = new ValueLocalization(mapRecord(this.pluralizations, pluralization => pluralization.get(count)));
        return valueLocalization.value({
            count: `${count}`,
            ...args
        });
    }
}

function swap1stAnd2ndLevel<Level1Key extends string, Level2Key extends string, T>(record: Record<Level1Key, Record<Level2Key, T>>): Record<Level2Key, Record<Level1Key, T>> {
    const swapped = {} as Record<Level2Key, Record<Level1Key, T>>;
    for (const key1 of keys(record)) {
        for (const key2 of keys(record[key1]) as Level2Key[]) {
            if (!(key2 in swapped))
                swapped[key2] = {} as Record<Level1Key, T>;
            swapped[key2][key1] = record[key1][key2];
        }
    }
    return swapped;
}

export class Localization {

    public static locale: keyof typeof localizations = 'en';

    public static readonly shared = Localization.getSubLocalization(localizations);

    private static getSubLocalization<T extends SubLocalizationType>(_localizations: Record<keyof typeof localizations, T>): SubLocalization<T> {
        const _localizationValue = values(_localizations);
        if (_localizationValue.length === 0)
            return {} as SubLocalization<T>;
        if (typeof _localizationValue[0] === 'object' && !(_localizationValue[0] instanceof Pluralization)) {
            const swapped = swap1stAnd2ndLevel(_localizations as Record<string, Record<string, SubLocalizationType>>);
            return mapRecord(swapped, subLocalization => Localization.getSubLocalization(subLocalization)) as SubLocalization<T>;
        }
        if (typeof _localizationValue[0] === 'string')
            return new ValueLocalization(_localizations as Record<keyof typeof localizations, string>) as SubLocalization<T>;
        if (_localizationValue[0] instanceof Pluralization)
            return new PluralLocalization(_localizations as Record<keyof typeof localizations, Pluralization>) as SubLocalization<T>;
        throw new Error('Invalid localization structure');
    }
}
