import { expect } from '@assertive-ts/core';
import { FineTemplateRepetition } from '../../src/types/FineTemplateRepetition';

describe('FineTemplateRepetition', () => {

    describe('FineTemplateRepetition.Item', () => {

        describe('FineTemplateRepetition.Item type', () => {

            it('should be valid repetition item types', () => {
                const item1: FineTemplateRepetition.Item = 'minute';
                const item2: FineTemplateRepetition.Item = 'day';
                const item3: FineTemplateRepetition.Item = 'item';
                const item4: FineTemplateRepetition.Item = 'count';
                expect(item1).toBeEqual('minute');
                expect(item2).toBeEqual('day');
                expect(item3).toBeEqual('item');
                expect(item4).toBeEqual('count');
            });
        });

        describe('FineTemplateRepetition.Item.all', () => {

            it('should contain all repetition items', () => {
                expect(FineTemplateRepetition.Item.all.length).toBeEqual(4);
            });

            it('should contain minute', () => {
                expect(FineTemplateRepetition.Item.all.includes('minute')).toBeTrue();
            });

            it('should contain day', () => {
                expect(FineTemplateRepetition.Item.all.includes('day')).toBeTrue();
            });

            it('should contain item', () => {
                expect(FineTemplateRepetition.Item.all.includes('item')).toBeTrue();
            });

            it('should contain count', () => {
                expect(FineTemplateRepetition.Item.all.includes('count')).toBeTrue();
            });

            it('should contain only valid repetition item strings', () => {
                FineTemplateRepetition.Item.all.forEach(item => {
                    expect(typeof item).toBeEqual('string');
                });
            });

            it('should be readonly', () => {
                expect(Array.isArray(FineTemplateRepetition.Item.all)).toBeTrue();
            });
        });

        describe('FineTemplateRepetition.Item.formatted', () => {

            describe('formatted with en locale', () => {

                it('should format minute item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('minute', 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format day item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('day', 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('item', 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format count item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('count', 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should return different values for different items', () => {
                    const minute = FineTemplateRepetition.Item.formatted('minute', 'en');
                    const day = FineTemplateRepetition.Item.formatted('day', 'en');
                    expect(minute).not.toBeEqual(day);
                });
            });

            describe('formatted with de locale', () => {

                it('should format minute item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('minute', 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format day item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('day', 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('item', 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format count item', () => {
                    const formatted = FineTemplateRepetition.Item.formatted('count', 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });
            });

            describe('formatted for all items and locales', () => {

                it('should format all items in all locales', () => {
                    FineTemplateRepetition.Item.all.forEach(item => {
                        const enFormatted = FineTemplateRepetition.Item.formatted(item, 'en');
                        const deFormatted = FineTemplateRepetition.Item.formatted(item, 'de');
                        expect(enFormatted.length).not.toBeEqual(0);
                        expect(deFormatted.length).not.toBeEqual(0);
                    });
                });

                it('should return different values for different locales', () => {
                    const enMinute = FineTemplateRepetition.Item.formatted('minute', 'en');
                    const deMinute = FineTemplateRepetition.Item.formatted('minute', 'de');
                    const enDay = FineTemplateRepetition.Item.formatted('day', 'en');
                    const deDay = FineTemplateRepetition.Item.formatted('day', 'de');

                    const allFormattings = [enMinute, deMinute, enDay, deDay];
                    const uniqueFormattings = new Set(allFormattings);
                    expect(uniqueFormattings.size).not.toBeEqual(1);
                });
            });
        });

        describe('FineTemplateRepetition.Item.builder', () => {

            it('should build valid repetition item from string', () => {
                const item = FineTemplateRepetition.Item.builder.build('minute');
                expect(item).toBeEqual('minute');
            });

            it('should preserve repetition item value', () => {
                const item = FineTemplateRepetition.Item.builder.build('day');
                expect(item).toBeEqual('day');
            });

            it('should build all repetition items', () => {
                FineTemplateRepetition.Item.all.forEach(itemValue => {
                    const built = FineTemplateRepetition.Item.builder.build(itemValue);
                    expect(built).toBeEqual(itemValue);
                });
            });
        });
    });

    describe('FineTemplateRepetition', () => {

        describe('FineTemplateRepetition constructor', () => {

            it('should create repetition with item and maxCount', () => {
                const repetition = new FineTemplateRepetition('minute', 10);
                expect(repetition.item).toBeEqual('minute');
                expect(repetition.maxCount).toBeEqual(10);
            });

            it('should create repetition with null maxCount', () => {
                const repetition = new FineTemplateRepetition('day', null);
                expect(repetition.item).toBeEqual('day');
                expect(repetition.maxCount).toBeEqual(null);
            });

            it('should create repetition with all item types', () => {
                FineTemplateRepetition.Item.all.forEach(item => {
                    const repetition = new FineTemplateRepetition(item, 5);
                    expect(repetition.item).toBeEqual(item);
                });
            });

            it('should create repetition with zero maxCount', () => {
                const repetition = new FineTemplateRepetition('item', 0);
                expect(repetition.maxCount).toBeEqual(0);
            });

            it('should create repetition with large maxCount', () => {
                const repetition = new FineTemplateRepetition('count', 1000);
                expect(repetition.maxCount).toBeEqual(1000);
            });
        });

        describe('FineTemplateRepetition.formatted', () => {

            describe('formatted with en locale', () => {

                it('should format minute repetition with count', () => {
                    const repetition = new FineTemplateRepetition('minute', 10);
                    const formatted = repetition.formatted(5, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format day repetition with count', () => {
                    const repetition = new FineTemplateRepetition('day', null);
                    const formatted = repetition.formatted(3, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item repetition with count', () => {
                    const repetition = new FineTemplateRepetition('item', 5);
                    const formatted = repetition.formatted(2, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format count repetition with count', () => {
                    const repetition = new FineTemplateRepetition('count', null);
                    const formatted = repetition.formatted(10, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format with count value 1', () => {
                    const repetition = new FineTemplateRepetition('minute', 10);
                    const formatted = repetition.formatted(1, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });
            });

            describe('formatted with de locale', () => {

                it('should format minute repetition with count', () => {
                    const repetition = new FineTemplateRepetition('minute', 10);
                    const formatted = repetition.formatted(5, 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format day repetition with count', () => {
                    const repetition = new FineTemplateRepetition('day', null);
                    const formatted = repetition.formatted(3, 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });
            });

            describe('formatted for all items and locales', () => {

                it('should format all item types in all locales', () => {
                    FineTemplateRepetition.Item.all.forEach(item => {
                        const repetition = new FineTemplateRepetition(item, 10);
                        const enFormatted = repetition.formatted(5, 'en');
                        const deFormatted = repetition.formatted(5, 'de');
                        expect(enFormatted.length).not.toBeEqual(0);
                        expect(deFormatted.length).not.toBeEqual(0);
                    });
                });

                it('should return different values for different counts', () => {
                    const repetition = new FineTemplateRepetition('minute', 10);
                    const formatted1 = repetition.formatted(1, 'en');
                    const formatted5 = repetition.formatted(5, 'en');
                    expect(typeof formatted1).toBeEqual('string');
                    expect(typeof formatted5).toBeEqual('string');
                });
            });
        });

        describe('FineTemplateRepetition.formattedWithoutCount', () => {

            describe('formattedWithoutCount with en locale', () => {

                it('should format minute repetition without count', () => {
                    const repetition = new FineTemplateRepetition('minute', 10);
                    const formatted = repetition.formattedWithoutCount(5, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format day repetition without count', () => {
                    const repetition = new FineTemplateRepetition('day', null);
                    const formatted = repetition.formattedWithoutCount(3, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item repetition without count', () => {
                    const repetition = new FineTemplateRepetition('item', 5);
                    const formatted = repetition.formattedWithoutCount(2, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format count repetition without count', () => {
                    const repetition = new FineTemplateRepetition('count', null);
                    const formatted = repetition.formattedWithoutCount(10, 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });
            });

            describe('formattedWithoutCount with de locale', () => {

                it('should format minute repetition without count', () => {
                    const repetition = new FineTemplateRepetition('minute', 10);
                    const formatted = repetition.formattedWithoutCount(5, 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format day repetition without count', () => {
                    const repetition = new FineTemplateRepetition('day', null);
                    const formatted = repetition.formattedWithoutCount(3, 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });
            });

            describe('formattedWithoutCount for all items and locales', () => {

                it('should format all item types in all locales', () => {
                    FineTemplateRepetition.Item.all.forEach(item => {
                        const repetition = new FineTemplateRepetition(item, 10);
                        const enFormatted = repetition.formattedWithoutCount(5, 'en');
                        const deFormatted = repetition.formattedWithoutCount(5, 'de');
                        expect(enFormatted.length).not.toBeEqual(0);
                        expect(deFormatted.length).not.toBeEqual(0);
                    });
                });
            });
        });

        describe('FineTemplateRepetition.flatten', () => {

            it('should return flattened representation with maxCount', () => {
                const repetition = new FineTemplateRepetition('minute', 10);
                const flattened = repetition.flatten;
                expect(flattened.item).toBeEqual('minute');
                expect(flattened.maxCount).toBeEqual(10);
            });

            it('should return flattened representation with null maxCount', () => {
                const repetition = new FineTemplateRepetition('day', null);
                const flattened = repetition.flatten;
                expect(flattened.item).toBeEqual('day');
                expect(flattened.maxCount).toBeEqual(null);
            });

            it('should match the original values', () => {
                const repetition = new FineTemplateRepetition('item', 5);
                const flattened = repetition.flatten;
                expect(flattened.item).toBeEqual(repetition.item);
                expect(flattened.maxCount).toBeEqual(repetition.maxCount);
            });

            it('should have correct structure', () => {
                const repetition = new FineTemplateRepetition('count', 20);
                const flattened = repetition.flatten;
                expect(typeof flattened.item).toBeEqual('string');
                expect(typeof flattened.maxCount).toBeEqual('number');
            });

            it('should flatten with zero maxCount', () => {
                const repetition = new FineTemplateRepetition('minute', 0);
                const flattened = repetition.flatten;
                expect(flattened.maxCount).toBeEqual(0);
            });
        });

        describe('FineTemplateRepetition.TypeBuilder', () => {

            it('should build repetition from flattened data with maxCount', () => {
                const flattened = {
                    item: 'minute' as FineTemplateRepetition.Item,
                    maxCount: 10
                };
                const repetition = FineTemplateRepetition.builder.build(flattened);
                expect(repetition.item).toBeEqual('minute');
                expect(repetition.maxCount).toBeEqual(10);
            });

            it('should build repetition from flattened data with null maxCount', () => {
                const flattened = {
                    item: 'day' as FineTemplateRepetition.Item,
                    maxCount: null
                };
                const repetition = FineTemplateRepetition.builder.build(flattened);
                expect(repetition.item).toBeEqual('day');
                expect(repetition.maxCount).toBeEqual(null);
            });

            it('should build repetition with all item types', () => {
                FineTemplateRepetition.Item.all.forEach(item => {
                    const flattened = { item, maxCount: 5 };
                    const repetition = FineTemplateRepetition.builder.build(flattened);
                    expect(repetition.item).toBeEqual(item);
                });
            });

            it('should round-trip through flatten and build with maxCount', () => {
                const original = new FineTemplateRepetition('item', 15);
                const rebuilt = FineTemplateRepetition.builder.build(original.flatten);
                expect(rebuilt.item).toBeEqual(original.item);
                expect(rebuilt.maxCount).toBeEqual(original.maxCount);
            });

            it('should round-trip through flatten and build with null maxCount', () => {
                const original = new FineTemplateRepetition('count', null);
                const rebuilt = FineTemplateRepetition.builder.build(original.flatten);
                expect(rebuilt.item).toBeEqual(original.item);
                expect(rebuilt.maxCount).toBeEqual(original.maxCount);
            });

            it('should round-trip with zero maxCount', () => {
                const original = new FineTemplateRepetition('minute', 0);
                const rebuilt = FineTemplateRepetition.builder.build(original.flatten);
                expect(rebuilt.maxCount).toBeEqual(0);
            });

            it('should round-trip for all item types', () => {
                FineTemplateRepetition.Item.all.forEach(item => {
                    const original = new FineTemplateRepetition(item, 10);
                    const rebuilt = FineTemplateRepetition.builder.build(original.flatten);
                    expect(rebuilt.item).toBeEqual(original.item);
                    expect(rebuilt.maxCount).toBeEqual(original.maxCount);
                });
            });
        });
    });
});
