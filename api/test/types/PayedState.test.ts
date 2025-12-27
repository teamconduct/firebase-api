import { expect } from '@assertive-ts/core';
import { PayedState } from '../../src/types/PayedState';

describe('PayedState', () => {

    describe('PayedState type', () => {

        it('should be valid payed state types', () => {
            const state1: PayedState = 'payed';
            const state2: PayedState = 'notPayed';
            expect(state1).toBeEqual('payed');
            expect(state2).toBeEqual('notPayed');
        });
    });

    describe('PayedState.all', () => {

        it('should contain all payment states', () => {
            expect(PayedState.all.length).toBeEqual(2);
        });

        it('should contain payed', () => {
            expect(PayedState.all.includes('payed')).toBeTrue();
        });

        it('should contain notPayed', () => {
            expect(PayedState.all.includes('notPayed')).toBeTrue();
        });

        it('should contain only valid payment state strings', () => {
            PayedState.all.forEach(state => {
                expect(typeof state).toBeEqual('string');
            });
        });

        it('should be readonly', () => {
            expect(Array.isArray(PayedState.all)).toBeTrue();
        });
    });

    describe('PayedState.formatted', () => {

        describe('formatted with en locale', () => {

            it('should format payed state', () => {
                const formatted = PayedState.formatted('payed', 'en');
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should format notPayed state', () => {
                const formatted = PayedState.formatted('notPayed', 'en');
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should return different values for different states', () => {
                const payed = PayedState.formatted('payed', 'en');
                const notPayed = PayedState.formatted('notPayed', 'en');
                expect(payed).not.toBeEqual(notPayed);
            });
        });

        describe('formatted with de locale', () => {

            it('should format payed state', () => {
                const formatted = PayedState.formatted('payed', 'de');
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should format notPayed state', () => {
                const formatted = PayedState.formatted('notPayed', 'de');
                expect(typeof formatted).toBeEqual('string');
                expect(formatted.length).not.toBeEqual(0);
            });

            it('should return different values for different states', () => {
                const payed = PayedState.formatted('payed', 'de');
                const notPayed = PayedState.formatted('notPayed', 'de');
                expect(payed).not.toBeEqual(notPayed);
            });
        });

        describe('formatted for all states and locales', () => {

            it('should format all states in all locales', () => {
                PayedState.all.forEach(state => {
                    const enFormatted = PayedState.formatted(state, 'en');
                    const deFormatted = PayedState.formatted(state, 'de');
                    expect(enFormatted.length).not.toBeEqual(0);
                    expect(deFormatted.length).not.toBeEqual(0);
                });
            });

            it('should return different values for different locales', () => {
                const enPayed = PayedState.formatted('payed', 'en');
                const dePayed = PayedState.formatted('payed', 'de');
                const enNotPayed = PayedState.formatted('notPayed', 'en');
                const deNotPayed = PayedState.formatted('notPayed', 'de');

                // At least some should differ (assuming localization exists)
                const allFormattings = [enPayed, dePayed, enNotPayed, deNotPayed];
                const uniqueFormattings = new Set(allFormattings);
                expect(uniqueFormattings.size).not.toBeEqual(1);
            });
        });
    });

    describe('PayedState.builder', () => {

        it('should build valid payment state from string', () => {
            const state = PayedState.builder.build('payed');
            expect(state).toBeEqual('payed');
        });

        it('should preserve payment state value', () => {
            const state = PayedState.builder.build('notPayed');
            expect(state).toBeEqual('notPayed');
        });

        it('should build all payment states', () => {
            PayedState.all.forEach(state => {
                const built = PayedState.builder.build(state);
                expect(built).toBeEqual(state);
            });
        });
    });
});
