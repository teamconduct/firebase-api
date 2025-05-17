import { expect } from '@assertive-ts/core';
import { keys, values } from '@stevenkellner/typescript-common-functionality';
import { Localization, localizationKey, localizationNKey } from '../src/types/Localization';

export function localizationWithoutDefault<T extends Record<string, unknown>>(record: T): Exclude<T, 'default'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { default: _, ...rest } = record;
    return rest as Exclude<T, 'default'>;
}

export function hasSameKeys(record1: Record<string, unknown>, record2: Record<string, unknown>) {
    expect(keys(record1)).toHaveSameMembers(keys(record2));
    for (const key of keys(record1)) {
        if (typeof record1[key] === 'object' && record1[key] !== null) {
            expect(record2[key]).not.toBeUndefined();
            expect(typeof record2[key]).toBeEqual('object');
            expect(record1[key]).not.toBeNull();
            hasSameKeys(record1[key] as Record<string, unknown>, record2[key] as Record<string, unknown>);
        } else {
            expect(typeof record1[key]).toBeEqual('string');
            expect(typeof record2[key]).toBeEqual('string');
        }
    }
}

export class TestedKeys {

    private tested: Record<string, boolean>;

    public constructor(localization: Record<string, unknown>) {
        this.tested = this.mapCheckTestedRecord(localizationWithoutDefault(localization));
    }

    private mapCheckTestedRecord(record: Record<string, unknown>): Record<string, boolean> {
        function getKeyList(record: Record<string, unknown>, key: string): string[] {
            return keys(record).flatMap(k => {
                if (typeof record[k] === 'object' && record[k] !== null)
                    return getKeyList(record[k] as Record<string, unknown>, `${key}${k}.`);
                else
                    return `${key}${k}`;
            });
        }
        const testedRecord: Record<string, boolean> = {};
        for (const key of getKeyList(record, ''))
            testedRecord[key] = false;
        return testedRecord;
    }

    public checkAllTested() {
        for (const value of values(this.tested))
            expect(value).toBeEqual(true);
    }

    public test(getKey: (key: typeof localizationKey) => string, expected: string) {
        this.tested[getKey(localizationKey)] = true;
        expect(Localization.shared.get(getKey)).toBeEqual(expected);
    }

    public testArgs(getKey: (key: typeof localizationKey) => string, args: string[], expected: string) {
        this.tested[getKey(localizationKey)] = true;
        expect(Localization.shared.get(getKey, ...args)).toBeEqual(expected);
    }

    public testN(getKey: (key: typeof localizationNKey) => string, count: number, expected: string) {
        if (count === 1)
            this.tested[`${getKey(localizationNKey)}.one`] = true;
        else
            this.tested[`${getKey(localizationNKey)}.other`] = true;
        expect(Localization.shared.getN(getKey, count)).toBeEqual(expected);
    }
}
