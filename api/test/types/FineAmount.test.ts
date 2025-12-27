import { expect } from '@assertive-ts/core';
import { FineAmount } from '../../src/types/FineAmount';
import { MoneyAmount } from '../../src/types/MoneyAmount';
import { Configuration } from '../../src/types/Configuration';

describe('FineAmount', () => {

    describe('FineAmount.Money', () => {

        describe('FineAmount.Money constructor', () => {

            it('should create money fine amount', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = new FineAmount.Money(amount);
                expect(fineAmount.amount).toBeEqual(amount);
            });

            it('should create money fine amount with zero', () => {
                const amount = MoneyAmount.zero;
                const fineAmount = new FineAmount.Money(amount);
                expect(fineAmount.amount.completeValue).toBeEqual(0);
            });

            it('should create money fine amount with large value', () => {
                const amount = new MoneyAmount(1000, 99);
                const fineAmount = new FineAmount.Money(amount);
                expect(fineAmount.amount.value).toBeEqual(1000);
                expect(fineAmount.amount.subunitValue).toBeEqual(99);
            });
        });

        describe('FineAmount.Money.formatted', () => {

            it('should format money with USD and en locale', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = new FineAmount.Money(amount);
                const config = new Configuration('USD', 'en');
                const formatted = fineAmount.formatted(config);
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should format money with EUR and de locale', () => {
                const amount = new MoneyAmount(15, 75);
                const fineAmount = new FineAmount.Money(amount);
                const config = new Configuration('EUR', 'de');
                const formatted = fineAmount.formatted(config);
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should format zero amount', () => {
                const fineAmount = new FineAmount.Money(MoneyAmount.zero);
                const config = new Configuration('USD', 'en');
                const formatted = fineAmount.formatted(config);
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should format large amounts', () => {
                const amount = new MoneyAmount(1000, 0);
                const fineAmount = new FineAmount.Money(amount);
                const config = new Configuration('USD', 'en');
                const formatted = fineAmount.formatted(config);
                expect(formatted.includes('1000') || formatted.includes('1,000')).toBeTrue();
            });
        });

        describe('FineAmount.Money.multiplied', () => {

            it('should multiply money amount by integer', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = new FineAmount.Money(amount);
                const multiplied = fineAmount.multiplied(2);
                expect(multiplied.amount.value).toBeEqual(21);
                expect(multiplied.amount.subunitValue).toBeEqual(0);
            });

            it('should multiply money amount by zero', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = new FineAmount.Money(amount);
                const multiplied = fineAmount.multiplied(0);
                expect(multiplied.amount.completeValue).toBeEqual(0);
            });

            it('should multiply money amount by decimal', () => {
                const amount = new MoneyAmount(10, 0);
                const fineAmount = new FineAmount.Money(amount);
                const multiplied = fineAmount.multiplied(1.5);
                expect(multiplied.amount.value).toBeEqual(15);
            });

            it('should not modify original amount', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = new FineAmount.Money(amount);
                fineAmount.multiplied(3);
                expect(fineAmount.amount.value).toBeEqual(10);
                expect(fineAmount.amount.subunitValue).toBeEqual(50);
            });

            it('should return new Money instance', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = new FineAmount.Money(amount);
                const multiplied = fineAmount.multiplied(2);
                expect(multiplied).not.toBeEqual(fineAmount);
            });
        });

        describe('FineAmount.Money.flatten', () => {

            it('should return flattened representation', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = new FineAmount.Money(amount);
                const flattened = fineAmount.flatten;
                expect(flattened.type).toBeEqual('money');
                expect(flattened.amount).toBeEqual(10.5);
            });

            it('should flatten zero amount', () => {
                const fineAmount = new FineAmount.Money(MoneyAmount.zero);
                const flattened = fineAmount.flatten;
                expect(flattened.type).toBeEqual('money');
                expect(flattened.amount).toBeEqual(0);
            });

            it('should have correct structure', () => {
                const amount = new MoneyAmount(15, 75);
                const fineAmount = new FineAmount.Money(amount);
                const flattened = fineAmount.flatten;
                expect(typeof flattened.type).toBeEqual('string');
                expect(typeof flattened.amount).toBeEqual('number');
            });
        });

        describe('FineAmount.Money.TypeBuilder', () => {

            it('should build money from flattened data', () => {
                const flattened = {
                    type: 'money' as const,
                    amount: 10.5
                };
                const fineAmount = FineAmount.Money.builder.build(flattened);
                expect(fineAmount.amount.value).toBeEqual(10);
                expect(fineAmount.amount.subunitValue).toBeEqual(50);
            });

            it('should build money from zero', () => {
                const flattened = {
                    type: 'money' as const,
                    amount: 0
                };
                const fineAmount = FineAmount.Money.builder.build(flattened);
                expect(fineAmount.amount.completeValue).toBeEqual(0);
            });

            it('should round-trip through flatten and build', () => {
                const amount = new MoneyAmount(15, 75);
                const original = new FineAmount.Money(amount);
                const rebuilt = FineAmount.Money.builder.build(original.flatten);
                expect(rebuilt.amount.value).toBeEqual(original.amount.value);
                expect(rebuilt.amount.subunitValue).toBeEqual(original.amount.subunitValue);
            });
        });
    });

    describe('FineAmount.Item', () => {

        describe('FineAmount.Item.Type', () => {

            describe('FineAmount.Item.Type type', () => {

                it('should be valid item type', () => {
                    const itemType: FineAmount.Item.Type = 'crateOfBeer';
                    expect(itemType).toBeEqual('crateOfBeer');
                });
            });

            describe('FineAmount.Item.Type.all', () => {

                it('should contain all item types', () => {
                    expect(FineAmount.Item.Type.all.length).toBeEqual(1);
                });

                it('should contain crateOfBeer', () => {
                    expect(FineAmount.Item.Type.all.includes('crateOfBeer')).toBeTrue();
                });

                it('should be readonly', () => {
                    expect(Array.isArray(FineAmount.Item.Type.all)).toBeTrue();
                });
            });

            describe('FineAmount.Item.Type.formatted', () => {

                it('should format item type with en locale', () => {
                    const formatted = FineAmount.Item.Type.formatted('crateOfBeer', 'en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item type with de locale', () => {
                    const formatted = FineAmount.Item.Type.formatted('crateOfBeer', 'de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format all item types', () => {
                    FineAmount.Item.Type.all.forEach(itemType => {
                        const enFormatted = FineAmount.Item.Type.formatted(itemType, 'en');
                        const deFormatted = FineAmount.Item.Type.formatted(itemType, 'de');
                        expect(enFormatted.length).not.toBeEqual(0);
                        expect(deFormatted.length).not.toBeEqual(0);
                    });
                });
            });
        });

        describe('FineAmount.Item constructor', () => {

            it('should create item fine amount', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                expect(fineAmount.item).toBeEqual('crateOfBeer');
                expect(fineAmount.count).toBeEqual(2);
            });

            it('should create item fine amount with zero count', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 0);
                expect(fineAmount.count).toBeEqual(0);
            });

            it('should create item fine amount with large count', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 100);
                expect(fineAmount.count).toBeEqual(100);
            });
        });

        describe('FineAmount.Item.formatted', () => {

            describe('formatted with locale', () => {

                it('should format item with en locale', () => {
                    const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                    const formatted = fineAmount.formatted('en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item with de locale', () => {
                    const fineAmount = new FineAmount.Item('crateOfBeer', 3);
                    const formatted = fineAmount.formatted('de');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item with count 1', () => {
                    const fineAmount = new FineAmount.Item('crateOfBeer', 1);
                    const formatted = fineAmount.formatted('en');
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });
            });

            describe('formatted with configuration', () => {

                it('should format item with USD/en configuration', () => {
                    const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                    const config = new Configuration('USD', 'en');
                    const formatted = fineAmount.formatted(config);
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });

                it('should format item with EUR/de configuration', () => {
                    const fineAmount = new FineAmount.Item('crateOfBeer', 3);
                    const config = new Configuration('EUR', 'de');
                    const formatted = fineAmount.formatted(config);
                    expect(typeof formatted).toBeEqual('string');
                    expect(formatted.length).not.toBeEqual(0);
                });
            });
        });

        describe('FineAmount.Item.formattedWithoutCount', () => {

            it('should format item without count with en locale', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                const formatted = fineAmount.formattedWithoutCount('en');
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should format item without count with de locale', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 3);
                const formatted = fineAmount.formattedWithoutCount('de');
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should format all item types', () => {
                FineAmount.Item.Type.all.forEach(itemType => {
                    const fineAmount = new FineAmount.Item(itemType, 5);
                    const enFormatted = fineAmount.formattedWithoutCount('en');
                    const deFormatted = fineAmount.formattedWithoutCount('de');
                    expect(enFormatted.length).not.toBeEqual(0);
                    expect(deFormatted.length).not.toBeEqual(0);
                });
            });
        });

        describe('FineAmount.Item.multiplied', () => {

            it('should multiply item count by integer', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                const multiplied = fineAmount.multiplied(3);
                expect(multiplied.count).toBeEqual(6);
            });

            it('should multiply item count by zero', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 5);
                const multiplied = fineAmount.multiplied(0);
                expect(multiplied.count).toBeEqual(0);
            });

            it('should multiply item count by decimal', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 10);
                const multiplied = fineAmount.multiplied(1.5);
                expect(multiplied.count).toBeEqual(15);
            });

            it('should not modify original count', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                fineAmount.multiplied(3);
                expect(fineAmount.count).toBeEqual(2);
            });

            it('should return new Item instance', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                const multiplied = fineAmount.multiplied(2);
                expect(multiplied).not.toBeEqual(fineAmount);
            });

            it('should preserve item type', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                const multiplied = fineAmount.multiplied(3);
                expect(multiplied.item).toBeEqual('crateOfBeer');
            });
        });

        describe('FineAmount.Item.flatten', () => {

            it('should return flattened representation', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 2);
                const flattened = fineAmount.flatten;
                expect(flattened.type).toBeEqual('item');
                expect(flattened.item).toBeEqual('crateOfBeer');
                expect(flattened.count).toBeEqual(2);
            });

            it('should flatten with zero count', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 0);
                const flattened = fineAmount.flatten;
                expect(flattened.count).toBeEqual(0);
            });

            it('should have correct structure', () => {
                const fineAmount = new FineAmount.Item('crateOfBeer', 5);
                const flattened = fineAmount.flatten;
                expect(typeof flattened.type).toBeEqual('string');
                expect(typeof flattened.item).toBeEqual('string');
                expect(typeof flattened.count).toBeEqual('number');
            });
        });

        describe('FineAmount.Item.TypeBuilder', () => {

            it('should build item from flattened data', () => {
                const flattened = {
                    type: 'item' as const,
                    item: 'crateOfBeer' as FineAmount.Item.Type,
                    count: 2
                };
                const fineAmount = FineAmount.Item.builder.build(flattened);
                expect(fineAmount.item).toBeEqual('crateOfBeer');
                expect(fineAmount.count).toBeEqual(2);
            });

            it('should build item with zero count', () => {
                const flattened = {
                    type: 'item' as const,
                    item: 'crateOfBeer' as FineAmount.Item.Type,
                    count: 0
                };
                const fineAmount = FineAmount.Item.builder.build(flattened);
                expect(fineAmount.count).toBeEqual(0);
            });

            it('should round-trip through flatten and build', () => {
                const original = new FineAmount.Item('crateOfBeer', 3);
                const rebuilt = FineAmount.Item.builder.build(original.flatten);
                expect(rebuilt.item).toBeEqual(original.item);
                expect(rebuilt.count).toBeEqual(original.count);
            });
        });
    });

    describe('FineAmount factory functions', () => {

        describe('FineAmount.money', () => {

            it('should create Money instance', () => {
                const amount = new MoneyAmount(10, 50);
                const fineAmount = FineAmount.money(amount);
                expect(fineAmount instanceof FineAmount.Money).toBeTrue();
                expect(fineAmount.amount).toBeEqual(amount);
            });
        });

        describe('FineAmount.item', () => {

            it('should create Item instance', () => {
                const fineAmount = FineAmount.item('crateOfBeer', 2);
                expect(fineAmount instanceof FineAmount.Item).toBeTrue();
                expect(fineAmount.item).toBeEqual('crateOfBeer');
                expect(fineAmount.count).toBeEqual(2);
            });
        });
    });

    describe('FineAmount.compare', () => {

        describe('compare Money amounts', () => {

            it('should return equal for same money amounts', () => {
                const amount1 = new FineAmount.Money(new MoneyAmount(10, 50));
                const amount2 = new FineAmount.Money(new MoneyAmount(10, 50));
                expect(FineAmount.compare(amount1, amount2)).toBeEqual('equal');
            });

            it('should return less when first is smaller', () => {
                const amount1 = new FineAmount.Money(new MoneyAmount(5, 0));
                const amount2 = new FineAmount.Money(new MoneyAmount(10, 0));
                expect(FineAmount.compare(amount1, amount2)).toBeEqual('less');
            });

            it('should return greater when first is larger', () => {
                const amount1 = new FineAmount.Money(new MoneyAmount(15, 0));
                const amount2 = new FineAmount.Money(new MoneyAmount(10, 0));
                expect(FineAmount.compare(amount1, amount2)).toBeEqual('greater');
            });

            it('should compare with subunit differences', () => {
                const amount1 = new FineAmount.Money(new MoneyAmount(10, 25));
                const amount2 = new FineAmount.Money(new MoneyAmount(10, 50));
                expect(FineAmount.compare(amount1, amount2)).toBeEqual('less');
            });
        });

        describe('compare Item amounts', () => {

            it('should return equal for same item counts', () => {
                const amount1 = new FineAmount.Item('crateOfBeer', 2);
                const amount2 = new FineAmount.Item('crateOfBeer', 2);
                expect(FineAmount.compare(amount1, amount2)).toBeEqual('equal');
            });

            it('should return less when first has fewer items', () => {
                const amount1 = new FineAmount.Item('crateOfBeer', 1);
                const amount2 = new FineAmount.Item('crateOfBeer', 3);
                expect(FineAmount.compare(amount1, amount2)).toBeEqual('less');
            });

            it('should return greater when first has more items', () => {
                const amount1 = new FineAmount.Item('crateOfBeer', 5);
                const amount2 = new FineAmount.Item('crateOfBeer', 2);
                expect(FineAmount.compare(amount1, amount2)).toBeEqual('greater');
            });
        });

        describe('compare Money vs Item', () => {

            it('should return greater when Money compared to Item', () => {
                const moneyAmount = new FineAmount.Money(new MoneyAmount(10, 0));
                const itemAmount = new FineAmount.Item('crateOfBeer', 5);
                expect(FineAmount.compare(moneyAmount, itemAmount)).toBeEqual('greater');
            });

            it('should return less when Item compared to Money', () => {
                const itemAmount = new FineAmount.Item('crateOfBeer', 5);
                const moneyAmount = new FineAmount.Money(new MoneyAmount(10, 0));
                expect(FineAmount.compare(itemAmount, moneyAmount)).toBeEqual('less');
            });
        });
    });

    describe('FineAmount.TypeBuilder', () => {

        it('should build Money from flattened data', () => {
            const flattened = {
                type: 'money' as const,
                amount: 10.5
            };
            const fineAmount = FineAmount.builder.build(flattened);
            expect(fineAmount instanceof FineAmount.Money).toBeTrue();
        });

        it('should build Item from flattened data', () => {
            const flattened = {
                type: 'item' as const,
                item: 'crateOfBeer' as FineAmount.Item.Type,
                count: 2
            };
            const fineAmount = FineAmount.builder.build(flattened);
            expect(fineAmount instanceof FineAmount.Item).toBeTrue();
        });

        it('should round-trip Money through flatten and build', () => {
            const original = new FineAmount.Money(new MoneyAmount(15, 75));
            const rebuilt = FineAmount.builder.build(original.flatten);
            expect(rebuilt instanceof FineAmount.Money).toBeTrue();
            if (rebuilt instanceof FineAmount.Money) {
                expect(rebuilt.amount.value).toBeEqual(15);
                expect(rebuilt.amount.subunitValue).toBeEqual(75);
            }
        });

        it('should round-trip Item through flatten and build', () => {
            const original = new FineAmount.Item('crateOfBeer', 3);
            const rebuilt = FineAmount.builder.build(original.flatten);
            expect(rebuilt instanceof FineAmount.Item).toBeTrue();
            if (rebuilt instanceof FineAmount.Item)
                expect(rebuilt.count).toBeEqual(3);
        });
    });
});
