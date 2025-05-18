import { expect } from '@assertive-ts/core';
import { keys } from '@stevenkellner/typescript-common-functionality';
import { Pluralization } from '../src';

export function hasSameKeys(record1: Record<string, unknown>, record2: Record<string, unknown>) {
    expect(keys(record1)).toHaveSameMembers(keys(record2));
    for (const key of keys(record1)) {
        if (typeof record1[key] === 'object' && record1[key] !== null) {
            expect(record2[key]).not.toBeUndefined();
            expect(typeof record2[key]).toBeEqual('object');
            expect(record1[key]).not.toBeNull();
            if (record1[key] instanceof Pluralization)
                expect(record2[key]).toBeInstanceOf(Pluralization);
            else
                hasSameKeys(record1[key] as Record<string, unknown>, record2[key] as Record<string, unknown>);
        } else {
            expect(typeof record1[key]).toBeEqual('string');
            expect(typeof record2[key]).toBeEqual('string');
        }
    }
}
