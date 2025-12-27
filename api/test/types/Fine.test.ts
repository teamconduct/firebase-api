import { expect } from '@assertive-ts/core';
import { Fine } from '../../src/types/Fine';
import { FineAmount } from '../../src/types/FineAmount';
import { PayedState } from '../../src/types/PayedState';
import { Guid, UtcDate } from '@stevenkellner/typescript-common-functionality';

describe('Fine', () => {

    describe('Fine.Id', () => {

        describe('Fine.Id type', () => {

            it('should create a valid fine ID', () => {
                const guid = new Guid('a1234567-89ab-4def-0123-456789abcdef');
                const fineId = Fine.Id.builder.build(guid.guidString);
                expect(fineId.value).toBeEqual(guid);
            });
        });

        describe('Fine.Id.builder', () => {

            it('should build fine ID from GUID string', () => {
                const guidString = 'a1234567-89ab-4def-0123-456789abcdef';
                const fineId = Fine.Id.builder.build(guidString);
                expect(fineId.flatten).toBeEqual(guidString);
            });

            it('should preserve fine ID value', () => {
                const guidString = 'b2345678-9abc-4def-0123-456789abcdef';
                const fineId = Fine.Id.builder.build(guidString);
                expect(fineId.flatten).toBeEqual(guidString);
            });
        });
    });

    describe('Fine', () => {

        describe('Fine constructor', () => {

            it('should create a fine with all properties', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const payedState: PayedState = 'notPayed';
                const date = UtcDate.now;
                const reason = 'Late to practice';
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 20.00 });

                const fine = new Fine(fineId, payedState, date, reason, amount);
                expect(fine.id).toBeEqual(fineId);
                expect(fine.payedState).toBeEqual(payedState);
                expect(fine.date).toBeEqual(date);
                expect(fine.reason).toBeEqual(reason);
                expect(fine.amount).toBeEqual(amount);
            });

            it('should create a fine with payed state', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const payedState: PayedState = 'payed';
                const date = UtcDate.now;
                const reason = 'Missed meeting';
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 10.00 });
                const fine = new Fine(fineId, payedState, date, reason, amount);
                expect(fine.payedState).toBeEqual('payed');
            });

            it('should create a fine with notPayed state', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const payedState: PayedState = 'notPayed';
                const date = UtcDate.now;
                const reason = 'Forgot equipment';
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 3.50 });
                const fine = new Fine(fineId, payedState, date, reason, amount);
                expect(fine.payedState).toBeEqual('notPayed');
            });

            it('should create a fine with different reasons', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const fine1 = new Fine(fineId, 'notPayed', date, 'Reason 1', amount);
                const fine2 = new Fine(fineId, 'notPayed', date, 'Reason 2', amount);
                expect(fine1.reason).not.toBeEqual(fine2.reason);
            });

            it('should create a fine with different amounts', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const reason = 'Test fine';

                const amount1 = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const amount2 = FineAmount.Money.builder.build({ type: 'money', amount: 10.00 });

                const fine1 = new Fine(fineId, 'notPayed', date, reason, amount1);
                const fine2 = new Fine(fineId, 'notPayed', date, reason, amount2);
                expect((fine1.amount as FineAmount.Money).amount).not.toBeEqual((fine2.amount as FineAmount.Money).amount);
            });

            it('should handle empty reason string', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const fine = new Fine(fineId, 'notPayed', date, '', amount);
                expect(fine.reason).toBeEqual('');
            });

            it('should handle long reason strings', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const longReason = 'This is a very long reason for a fine that contains many details about what happened';

                const fine = new Fine(fineId, 'notPayed', date, longReason, amount);
                expect(fine.reason).toBeEqual(longReason);
            });
        });

        describe('Fine.flatten', () => {

            it('should return flattened representation with all properties', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const payedState: PayedState = 'notPayed';
                const date = UtcDate.now;
                const reason = 'Test reason';
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const fine = new Fine(fineId, payedState, date, reason, amount);
                const flattened = fine.flatten;

                expect(flattened.id).toBeEqual(fineId.flatten);
                expect(flattened.payedState).toBeEqual(payedState);
                expect(flattened.date).toBeEqual(date.flatten);
                expect(flattened.reason).toBeEqual(reason);
                expect(flattened.amount).toBeEqual(amount.flatten);
            });

            it('should flatten payed state correctly', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const fine = new Fine(fineId, 'payed', date, 'Paid fine', amount);
                const flattened = fine.flatten;
                expect(flattened.payedState).toBeEqual('payed');
            });

            it('should flatten notPayed state correctly', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const fine = new Fine(fineId, 'notPayed', date, 'Unpaid fine', amount);
                const flattened = fine.flatten;
                expect(flattened.payedState).toBeEqual('notPayed');
            });

            it('should match the original values', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const reason = 'Match test';
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 7.25 });
                const fine = new Fine(fineId, 'notPayed', date, reason, amount);
                const flattened = fine.flatten;

                expect(flattened.id).toBeEqual(fine.id.flatten);
                expect(flattened.payedState).toBeEqual(fine.payedState);
                expect(flattened.reason).toBeEqual(fine.reason);
            });

            it('should have correct structure', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const fine = new Fine(fineId, 'notPayed', date, 'Structure test', amount);
                const flattened = fine.flatten;

                expect(typeof flattened.id).toBeEqual('string');
                expect(typeof flattened.payedState).toBeEqual('string');
                expect(typeof flattened.date).toBeEqual('string');
                expect(typeof flattened.reason).toBeEqual('string');
                expect(typeof flattened.amount).toBeEqual('object');
            });
        });

        describe('Fine.TypeBuilder', () => {

            it('should build fine from flattened data', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    payedState: 'notPayed' as PayedState,
                    date: UtcDate.now.flatten,
                    reason: 'Build test',
                    amount: {
                        type: 'money' as const,
                        amount: 5.50
                    }
                };

                const fine = Fine.builder.build(flattened);
                expect(fine.id.flatten).toBeEqual(flattened.id);
                expect(fine.payedState).toBeEqual(flattened.payedState);
                expect(fine.reason).toBeEqual(flattened.reason);
                expect(fine.amount).toBeInstanceOf(FineAmount.Money);
                expect((fine.amount as FineAmount.Money).amount.value).toBeEqual(5);
                expect((fine.amount as FineAmount.Money).amount.subunitValue).toBeEqual(50);
            });

            it('should build fine with payed state', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    payedState: 'payed' as PayedState,
                    date: UtcDate.now.flatten,
                    reason: 'Payed fine',
                    amount: {
                        type: 'money' as const,
                        amount: 3.00
                    }
                };

                const fine = Fine.builder.build(flattened);
                expect(fine.payedState).toBeEqual('payed');
            });

            it('should build fine with notPayed state', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    payedState: 'notPayed' as PayedState,
                    date: UtcDate.now.flatten,
                    reason: 'Unpaid fine',
                    amount: {
                        type: 'money' as const,
                        amount: 7.00
                    }
                };

                const fine = Fine.builder.build(flattened);
                expect(fine.payedState).toBeEqual('notPayed');
            });

            it('should build fine with different reasons', () => {
                const flattened1 = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    payedState: 'notPayed' as PayedState,
                    date: UtcDate.now.flatten,
                    reason: 'Reason A',
                    amount: {
                        type: 'money' as const,
                        amount: 5.00
                    }
                };
                const flattened2 = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    payedState: 'notPayed' as PayedState,
                    date: UtcDate.now.flatten,
                    reason: 'Reason B',
                    amount: {
                        type: 'money' as const,
                        amount: 5.00
                    }
                };

                const fine1 = Fine.builder.build(flattened1);
                const fine2 = Fine.builder.build(flattened2);
                expect(fine1.reason).not.toBeEqual(fine2.reason);
            });

            it('should round-trip through flatten and build', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 12.00 });

                const original = new Fine(fineId, 'notPayed', date, 'Round-trip test', amount);
                const rebuilt = Fine.builder.build(original.flatten);

                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.payedState).toBeEqual(original.payedState);
                expect(rebuilt.reason).toBeEqual(original.reason);
                expect((rebuilt.amount as FineAmount.Money).amount).toBeEqual((original.amount as FineAmount.Money).amount);
            });

            it('should round-trip with payed state', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 12.00 });
                const original = new Fine(fineId, 'payed', date, 'Payed round-trip', amount);
                const rebuilt = Fine.builder.build(original.flatten);
                expect(rebuilt.payedState).toBeEqual('payed');
            });

            it('should round-trip with empty reason', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 5.00 });
                const original = new Fine(fineId, 'notPayed', date, '', amount);
                const rebuilt = Fine.builder.build(original.flatten);
                expect(rebuilt.reason).toBeEqual('');
            });

            it('should preserve all properties through multiple round-trips', () => {
                const fineId = Fine.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const date = UtcDate.now;
                const amount = FineAmount.Money.builder.build({ type: 'money', amount: 6.33 });
                const original = new Fine(fineId, 'notPayed', date, 'Multiple round-trips', amount);
                const rebuilt1 = Fine.builder.build(original.flatten);
                const rebuilt2 = Fine.builder.build(rebuilt1.flatten);

                expect(rebuilt2.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt2.payedState).toBeEqual(original.payedState);
                expect(rebuilt2.reason).toBeEqual(original.reason);
                expect((rebuilt2.amount as FineAmount.Money).amount).toBeEqual((original.amount as FineAmount.Money).amount);
            });
        });
    });
});
