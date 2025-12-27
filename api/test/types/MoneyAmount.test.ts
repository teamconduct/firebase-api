import { expect } from '@assertive-ts/core';
import { MoneyAmount } from '../../src/types/MoneyAmount';
import { Configuration } from '../../src/types/Configuration';

describe('MoneyAmount', () => {

    describe('MoneyAmount constructor', () => {

        it('should create a money amount with value and subunit', () => {
            const amount = new MoneyAmount(10, 50);
            expect(amount.value).toBeEqual(10);
            expect(amount.subunitValue).toBeEqual(50);
        });

        it('should create a money amount with zero value', () => {
            const amount = new MoneyAmount(0, 0);
            expect(amount.value).toBeEqual(0);
            expect(amount.subunitValue).toBeEqual(0);
        });

        it('should create a money amount with only subunit value', () => {
            const amount = new MoneyAmount(0, 75);
            expect(amount.value).toBeEqual(0);
            expect(amount.subunitValue).toBeEqual(75);
        });

        it('should create a money amount with large values', () => {
            const amount = new MoneyAmount(1000, 99);
            expect(amount.value).toBeEqual(1000);
            expect(amount.subunitValue).toBeEqual(99);
        });
    });

    describe('MoneyAmount.zero', () => {

        it('should return a money amount with zero value', () => {
            const zero = MoneyAmount.zero;
            expect(zero.value).toBeEqual(0);
            expect(zero.subunitValue).toBeEqual(0);
        });

        it('should return a new instance each time', () => {
            const zero1 = MoneyAmount.zero;
            const zero2 = MoneyAmount.zero;
            expect(zero1.value).toBeEqual(zero2.value);
            expect(zero1.subunitValue).toBeEqual(zero2.subunitValue);
        });

        it('should have complete value of zero', () => {
            const zero = MoneyAmount.zero;
            expect(zero.completeValue).toBeEqual(0);
        });
    });

    describe('MoneyAmount.added', () => {

        it('should add two money amounts without carry', () => {
            const amount1 = new MoneyAmount(10, 25);
            const amount2 = new MoneyAmount(5, 30);
            const result = amount1.added(amount2);
            expect(result.value).toBeEqual(15);
            expect(result.subunitValue).toBeEqual(55);
        });

        it('should add two money amounts with carry', () => {
            const amount1 = new MoneyAmount(10, 60);
            const amount2 = new MoneyAmount(5, 50);
            const result = amount1.added(amount2);
            expect(result.value).toBeEqual(16);
            expect(result.subunitValue).toBeEqual(10);
        });

        it('should add zero to amount', () => {
            const amount = new MoneyAmount(10, 50);
            const result = amount.added(MoneyAmount.zero);
            expect(result.value).toBeEqual(10);
            expect(result.subunitValue).toBeEqual(50);
        });

        it('should handle multiple carries', () => {
            const amount1 = new MoneyAmount(10, 99);
            const amount2 = new MoneyAmount(5, 99);
            const result = amount1.added(amount2);
            expect(result.value).toBeEqual(16);
            expect(result.subunitValue).toBeEqual(98);
        });

        it('should add amounts with only subunit values', () => {
            const amount1 = new MoneyAmount(0, 40);
            const amount2 = new MoneyAmount(0, 30);
            const result = amount1.added(amount2);
            expect(result.value).toBeEqual(0);
            expect(result.subunitValue).toBeEqual(70);
        });

        it('should carry over from subunit addition', () => {
            const amount1 = new MoneyAmount(0, 80);
            const amount2 = new MoneyAmount(0, 50);
            const result = amount1.added(amount2);
            expect(result.value).toBeEqual(1);
            expect(result.subunitValue).toBeEqual(30);
        });

        it('should not modify original amounts', () => {
            const amount1 = new MoneyAmount(10, 50);
            const amount2 = new MoneyAmount(5, 30);
            amount1.added(amount2);
            expect(amount1.value).toBeEqual(10);
            expect(amount1.subunitValue).toBeEqual(50);
        });
    });

    describe('MoneyAmount.multiplied', () => {

        it('should multiply money amount by integer', () => {
            const amount = new MoneyAmount(10, 25);
            const result = amount.multiplied(2);
            expect(result.value).toBeEqual(20);
            expect(result.subunitValue).toBeEqual(50);
        });

        it('should multiply with carry from subunit', () => {
            const amount = new MoneyAmount(10, 60);
            const result = amount.multiplied(2);
            expect(result.value).toBeEqual(21);
            expect(result.subunitValue).toBeEqual(20);
        });

        it('should multiply by zero', () => {
            const amount = new MoneyAmount(10, 50);
            const result = amount.multiplied(0);
            expect(result.value).toBeEqual(0);
            expect(result.subunitValue).toBeEqual(0);
        });

        it('should multiply by one', () => {
            const amount = new MoneyAmount(10, 50);
            const result = amount.multiplied(1);
            expect(result.value).toBeEqual(10);
            expect(result.subunitValue).toBeEqual(50);
        });

        it('should multiply by decimal factor', () => {
            const amount = new MoneyAmount(10, 0);
            const result = amount.multiplied(1.5);
            expect(result.value).toBeEqual(15);
            expect(result.subunitValue).toBeEqual(0);
        });

        it('should handle large multipliers', () => {
            const amount = new MoneyAmount(5, 25);
            const result = amount.multiplied(10);
            expect(result.value).toBeEqual(52);
            expect(result.subunitValue).toBeEqual(50);
        });

        it('should not modify original amount', () => {
            const amount = new MoneyAmount(10, 50);
            amount.multiplied(3);
            expect(amount.value).toBeEqual(10);
            expect(amount.subunitValue).toBeEqual(50);
        });
    });

    describe('MoneyAmount.formatted', () => {

        it('should format money amount in USD with en locale', () => {
            const amount = new MoneyAmount(10, 50);
            const config = new Configuration('USD', 'en');
            const formatted = amount.formatted('USD', config);
            expect(typeof formatted).toBeEqual('string');
            expect(formatted.length).not.toBeEqual(0);
        });

        it('should format money amount in EUR with de locale', () => {
            const amount = new MoneyAmount(10, 50);
            const config = new Configuration('EUR', 'de');
            const formatted = amount.formatted('EUR', config);
            expect(typeof formatted).toBeEqual('string');
            expect(formatted.length).not.toBeEqual(0);
        });

        it('should format zero amount', () => {
            const amount = MoneyAmount.zero;
            const config = new Configuration('USD', 'en');
            const formatted = amount.formatted('USD', config);
            expect(typeof formatted).toBeEqual('string');
            expect(formatted.length).not.toBeEqual(0);
        });

        it('should format large amounts', () => {
            const amount = new MoneyAmount(1000, 99);
            const config = new Configuration('USD', 'en');
            const formatted = amount.formatted('USD', config);
            expect(typeof formatted).toBeEqual('string');
            expect(formatted.includes('1000') || formatted.includes('1,000')).toBeTrue();
        });

        it('should handle different currencies', () => {
            const amount = new MoneyAmount(15, 75);
            const usdConfig = new Configuration('USD', 'en');
            const eurConfig = new Configuration('EUR', 'de');

            const usdFormatted = amount.formatted('USD', usdConfig);
            const eurFormatted = amount.formatted('EUR', eurConfig);

            expect(usdFormatted).not.toBeEqual(eurFormatted);
        });
    });

    describe('MoneyAmount.completeValue', () => {

        it('should return complete value as decimal', () => {
            const amount = new MoneyAmount(10, 50);
            expect(amount.completeValue).toBeEqual(10.5);
        });

        it('should return zero for zero amount', () => {
            const amount = MoneyAmount.zero;
            expect(amount.completeValue).toBeEqual(0);
        });

        it('should handle only subunit values', () => {
            const amount = new MoneyAmount(0, 75);
            expect(amount.completeValue).toBeEqual(0.75);
        });

        it('should handle whole numbers', () => {
            const amount = new MoneyAmount(15, 0);
            expect(amount.completeValue).toBeEqual(15);
        });

        it('should handle 99 subunits', () => {
            const amount = new MoneyAmount(10, 99);
            expect(amount.completeValue).toBeEqual(10.99);
        });

        it('should handle single digit subunits', () => {
            const amount = new MoneyAmount(10, 5);
            expect(amount.completeValue).toBeEqual(10.05);
        });
    });

    describe('MoneyAmount.flatten', () => {

        it('should return flattened value as decimal', () => {
            const amount = new MoneyAmount(10, 50);
            expect(amount.flatten).toBeEqual(10.5);
        });

        it('should flatten zero amount', () => {
            const amount = MoneyAmount.zero;
            expect(amount.flatten).toBeEqual(0);
        });

        it('should flatten amount with only subunits', () => {
            const amount = new MoneyAmount(0, 99);
            expect(amount.flatten).toBeEqual(0.99);
        });

        it('should match completeValue', () => {
            const amount = new MoneyAmount(15, 75);
            expect(amount.flatten).toBeEqual(amount.completeValue);
        });

        it('should return number type', () => {
            const amount = new MoneyAmount(10, 50);
            expect(typeof amount.flatten).toBeEqual('number');
        });
    });

    describe('MoneyAmount.TypeBuilder', () => {

        it('should build money amount from decimal value', () => {
            const amount = MoneyAmount.builder.build(10.5);
            expect(amount.value).toBeEqual(10);
            expect(amount.subunitValue).toBeEqual(50);
        });

        it('should build money amount from zero', () => {
            const amount = MoneyAmount.builder.build(0);
            expect(amount.value).toBeEqual(0);
            expect(amount.subunitValue).toBeEqual(0);
        });

        it('should build money amount from whole number', () => {
            const amount = MoneyAmount.builder.build(15);
            expect(amount.value).toBeEqual(15);
            expect(amount.subunitValue).toBeEqual(0);
        });

        it('should build money amount from small decimal', () => {
            const amount = MoneyAmount.builder.build(0.75);
            expect(amount.value).toBeEqual(0);
            expect(amount.subunitValue).toBeEqual(75);
        });

        it('should build money amount with 99 subunits', () => {
            const amount = MoneyAmount.builder.build(10.99);
            expect(amount.value).toBeEqual(10);
            expect(amount.subunitValue).toBeEqual(99);
        });

        it('should round subunit values properly', () => {
            const amount = MoneyAmount.builder.build(10.555);
            expect(amount.value).toBeEqual(10);
            expect(amount.subunitValue).toBeEqual(55);
        });

        it('should round-trip through flatten and build', () => {
            const original = new MoneyAmount(15, 75);
            const rebuilt = MoneyAmount.builder.build(original.flatten);
            expect(rebuilt.value).toBeEqual(original.value);
            expect(rebuilt.subunitValue).toBeEqual(original.subunitValue);
        });

        it('should round-trip with zero', () => {
            const original = MoneyAmount.zero;
            const rebuilt = MoneyAmount.builder.build(original.flatten);
            expect(rebuilt.value).toBeEqual(0);
            expect(rebuilt.subunitValue).toBeEqual(0);
        });

        it('should round-trip with large values', () => {
            const original = new MoneyAmount(1000, 99);
            const rebuilt = MoneyAmount.builder.build(original.flatten);
            expect(rebuilt.value).toBeEqual(1000);
            expect(rebuilt.subunitValue).toBeEqual(99);
        });
    });
});
