import { expect } from '@assertive-ts/core';
import { Currency } from '../../src/types/Currency';

describe('Currency', () => {

    describe('Currency type', () => {

        it('should be a valid currency type', () => {
            const currency1: Currency = 'EUR';
            const currency2: Currency = 'USD';

            expect(currency1).toBeEqual('EUR');
            expect(currency2).toBeEqual('USD');
        });
    });

    describe('Currency.all', () => {

        it('should contain only valid currency strings', () => {
            for (const currency of Currency.all) {
                expect(typeof currency).toBeEqual('string');
                expect(currency.length).toBeGreaterThan(0);
            }
        });

        it('should contain all available currencies', () => {
            expect(Currency.all.length).toBeEqual(2);
            expect(Currency.all).toContainAll('EUR', 'USD');
        });
    });

    describe('Currency.builder', () => {

        it('should build valid currency from string', () => {
            const currency1 = Currency.builder.build('EUR');
            const currency2 = Currency.builder.build('USD');

            expect(currency1).toBeEqual('EUR');
            expect(currency2).toBeEqual('USD');
        });

        it('should preserve currency value', () => {
            for (const currency of Currency.all) {
                const built = Currency.builder.build(currency);
                expect(built).toBeEqual(currency);
            }
        });
    });
});
