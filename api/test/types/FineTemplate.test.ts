import { expect } from '@assertive-ts/core';
import { FineTemplate } from '../../src/types/FineTemplate';
import { FineAmount } from '../../src/types/FineAmount';
import { FineTemplateRepetition } from '../../src/types/FineTemplateRepetition';
import { Guid } from '@stevenkellner/typescript-common-functionality';

describe('FineTemplate', () => {

    describe('FineTemplate.Id', () => {

        describe('FineTemplate.Id type', () => {

            it('should create a valid fine template ID', () => {
                const guid = new Guid('a1234567-89ab-4def-0123-456789abcdef');
                const templateId = FineTemplate.Id.builder.build(guid.guidString);
                expect(templateId.value).toBeEqual(guid);
            });
        });

        describe('FineTemplate.Id.builder', () => {

            it('should build fine template ID from GUID string', () => {
                const guidString = 'a1234567-89ab-4def-0123-456789abcdef';
                const templateId = FineTemplate.Id.builder.build(guidString);
                expect(templateId.flatten).toBeEqual(guidString);
            });

            it('should preserve fine template ID value', () => {
                const guidString = 'b2345678-9abc-4ef0-1234-56789abcdef0';
                const templateId = FineTemplate.Id.builder.build(guidString);
                expect(templateId.flatten).toBeEqual(guidString);
            });
        });
    });

    describe('FineTemplate', () => {

        describe('FineTemplate constructor', () => {

            it('should create fine template with all properties', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Late to practice';
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.50 });
                const repetition = new FineTemplateRepetition('minute', 10);

                const template = new FineTemplate(templateId, reason, amount, repetition);
                expect(template.id).toBeEqual(templateId);
                expect(template.reason).toBeEqual(reason);
                expect(template.amount).toBeEqual(amount);
                expect(template.repetition).toBeEqual(repetition);
            });

            it('should create fine template without repetition', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Forgot equipment';
                const amount = FineAmount.builder.build({ type: 'money', amount: 5.0 });

                const template = new FineTemplate(templateId, reason, amount, null);
                expect(template.repetition).toBeEqual(null);
            });

            it('should create fine template with different reasons', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.0 });

                const template1 = new FineTemplate(templateId, 'Reason 1', amount, null);
                const template2 = new FineTemplate(templateId, 'Reason 2', amount, null);
                expect(template1.reason).not.toBeEqual(template2.reason);
            });

            it('should create fine template with money amount', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test reason';
                const amount = FineAmount.builder.build({ type: 'money', amount: 15.75 });

                const template = new FineTemplate(templateId, reason, amount, null);
                expect(template.amount).toBeInstanceOf(FineAmount.Money);
                expect((template.amount as FineAmount.Money).amount.value).toBeEqual(15);
                expect((template.amount as FineAmount.Money).amount.subunitValue).toBeEqual(75);
            });

            it('should create fine template with item amount', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test reason';
                const amount = FineAmount.builder.build({ type: 'item', item: 'crateOfBeer', count: 2 });

                const template = new FineTemplate(templateId, reason, amount, null);
                expect(template.amount).toBeInstanceOf(FineAmount.Item);
                expect((template.amount as FineAmount.Item).item).toBeEqual('crateOfBeer');
                expect((template.amount as FineAmount.Item).count).toBeEqual(2);
            });

            it('should create fine template with different repetition types', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test reason';
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.0 });

                const repetition1 = new FineTemplateRepetition('minute', 5);
                const repetition2 = new FineTemplateRepetition('day', null);

                const template1 = new FineTemplate(templateId, reason, amount, repetition1);
                const template2 = new FineTemplate(templateId, reason, amount, repetition2);

                expect(template1.repetition?.item).toBeEqual('minute');
                expect(template2.repetition?.item).toBeEqual('day');
            });
        });

        describe('FineTemplate.flatten', () => {

            it('should return flattened representation with repetition', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Late to practice';
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.50 });
                const repetition = new FineTemplateRepetition('minute', 10);

                const template = new FineTemplate(templateId, reason, amount, repetition);
                const flattened = template.flatten;

                expect(flattened.id).toBeEqual(templateId.flatten);
                expect(flattened.reason).toBeEqual(reason);
                expect(flattened.amount).toBeEqual(amount.flatten);
                expect(flattened.repetition).not.toBeEqual(null);
            });

            it('should return flattened representation without repetition', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'One-time fine';
                const amount = FineAmount.builder.build({ type: 'money', amount: 5.0 });

                const template = new FineTemplate(templateId, reason, amount, null);
                const flattened = template.flatten;

                expect(flattened.repetition).toBeEqual(null);
            });

            it('should match the original values', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test reason';
                const amount = FineAmount.builder.build({ type: 'money', amount: 20.99 });
                const repetition = new FineTemplateRepetition('day', 5);

                const template = new FineTemplate(templateId, reason, amount, repetition);
                const flattened = template.flatten;

                expect(flattened.id).toBeEqual(template.id.flatten);
                expect(flattened.reason).toBeEqual(template.reason);
                expect(flattened.amount).toBeEqual(template.amount.flatten);
            });

            it('should have correct structure', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test';
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.0 });

                const template = new FineTemplate(templateId, reason, amount, null);
                const flattened = template.flatten;

                expect(typeof flattened.id).toBeEqual('string');
                expect(typeof flattened.reason).toBeEqual('string');
                expect(typeof flattened.amount).toBeEqual('object');
            });

            it('should flatten money amount correctly', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test';
                const amount = FineAmount.builder.build({ type: 'money', amount: 15.50 });

                const template = new FineTemplate(templateId, reason, amount, null);
                const flattened = template.flatten;

                expect(flattened.amount).toBeEqual({ type: 'money', amount: 15.50 });
            });

            it('should flatten item amount correctly', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test';
                const amount = FineAmount.builder.build({ type: 'item', item: 'crateOfBeer', count: 3 });
                const template = new FineTemplate(templateId, reason, amount, null);
                const flattened = template.flatten;

                expect(flattened.amount).toBeEqual({ type: 'item', item: 'crateOfBeer', count: 3 });
            });

            it('should flatten repetition when present', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test';
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.0 });
                const repetition = new FineTemplateRepetition('minute', 15);

                const template = new FineTemplate(templateId, reason, amount, repetition);
                const flattened = template.flatten;

                expect(flattened.repetition?.item).toBeEqual('minute');
                expect(flattened.repetition?.maxCount).toBeEqual(15);
            });
        });

        describe('FineTemplate.TypeBuilder', () => {

            it('should build fine template from flattened data with repetition', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    reason: 'Late to practice',
                    amount: { type: 'money' as const, amount: 10.50 },
                    repetition: { item: 'minute' as const, maxCount: 10 }
                };

                const template = FineTemplate.builder.build(flattened);
                expect(template.id.flatten).toBeEqual(flattened.id);
                expect(template.reason).toBeEqual(flattened.reason);
                expect(template.amount).toBeInstanceOf(FineAmount.Money);
                expect((template.amount as FineAmount.Money).amount.value).toBeEqual(10);
                expect(template.repetition?.item).toBeEqual('minute');
            });

            it('should build fine template from flattened data without repetition', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    reason: 'One-time fine',
                    amount: { type: 'money' as const, amount: 5.00 },
                    repetition: null
                };

                const template = FineTemplate.builder.build(flattened);
                expect(template.repetition).toBeEqual(null);
            });

            it('should build fine template with money amount', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    reason: 'Test',
                    amount: { type: 'money' as const, amount: 20.99 },
                    repetition: null
                };

                const template = FineTemplate.builder.build(flattened);
                expect(template.amount).toBeInstanceOf(FineAmount.Money);
                expect((template.amount as FineAmount.Money).amount.value).toBeEqual(20);
                expect((template.amount as FineAmount.Money).amount.subunitValue).toBeEqual(99);
            });

            it('should build fine template with item amount', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    reason: 'Test',
                    amount: { type: 'item' as const, item: 'crateOfBeer' as const, count: 2 },
                    repetition: null
                };

                const template = FineTemplate.builder.build(flattened);
                expect(template.amount).toBeInstanceOf(FineAmount.Item);
                expect((template.amount as FineAmount.Item).item).toBeEqual('crateOfBeer');
                expect((template.amount as FineAmount.Item).count).toBeEqual(2);
            });

            it('should build fine template with different repetition types', () => {
                const flattened1 = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    reason: 'Test',
                    amount: { type: 'money' as const, amount: 10.00 },
                    repetition: { item: 'day' as const, maxCount: null }
                };

                const template = FineTemplate.builder.build(flattened1);
                expect(template.repetition?.item).toBeEqual('day');
                expect(template.repetition?.maxCount).toBeEqual(null);
            });

            it('should round-trip through flatten and build with repetition', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Late to practice';
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.50 });
                const repetition = new FineTemplateRepetition('minute', 10);

                const original = new FineTemplate(templateId, reason, amount, repetition);
                const rebuilt = FineTemplate.builder.build(original.flatten);

                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.reason).toBeEqual(original.reason);
                expect(rebuilt.amount).toBeInstanceOf(FineAmount.Money);
                expect(original.amount).toBeInstanceOf(FineAmount.Money);
                expect((rebuilt.amount as FineAmount.Money).amount.value).toBeEqual((original.amount as FineAmount.Money).amount.value);
                expect(rebuilt.repetition?.item).toBeEqual(original.repetition?.item);
            });

            it('should round-trip through flatten and build without repetition', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'One-time fine';
                const amount = FineAmount.builder.build({ type: 'money', amount: 5.0 });

                const original = new FineTemplate(templateId, reason, amount, null);
                const rebuilt = FineTemplate.builder.build(original.flatten);

                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.repetition).toBeEqual(null);
            });

            it('should round-trip with money amount', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test';
                const amount = FineAmount.builder.build({ type: 'money', amount: 15.75 });

                const original = new FineTemplate(templateId, reason, amount, null);
                const rebuilt = FineTemplate.builder.build(original.flatten);

                expect(rebuilt.amount).toBeInstanceOf(FineAmount.Money);
                expect(original.amount).toBeInstanceOf(FineAmount.Money);
                expect((rebuilt.amount as FineAmount.Money).amount.value).toBeEqual((original.amount as FineAmount.Money).amount.value);
                expect((rebuilt.amount as FineAmount.Money).amount.subunitValue).toBeEqual((original.amount as FineAmount.Money).amount.subunitValue);
            });

            it('should round-trip with item amount', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Test';
                const amount = FineAmount.builder.build({ type: 'item', item: 'crateOfBeer', count: 3 });

                const original = new FineTemplate(templateId, reason, amount, null);
                const rebuilt = FineTemplate.builder.build(original.flatten);

                expect(rebuilt.amount).toBeInstanceOf(FineAmount.Item);
                expect(original.amount).toBeInstanceOf(FineAmount.Item);
                expect((rebuilt.amount as FineAmount.Item).item).toBeEqual((original.amount as FineAmount.Item).item);
                expect((rebuilt.amount as FineAmount.Item).count).toBeEqual((original.amount as FineAmount.Item).count);
            });

            it('should preserve reason through round-trip', () => {
                const templateId = FineTemplate.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const reason = 'Specific reason with special characters: äöü!';
                const amount = FineAmount.builder.build({ type: 'money', amount: 10.0 });

                const original = new FineTemplate(templateId, reason, amount, null);
                const rebuilt = FineTemplate.builder.build(original.flatten);

                expect(rebuilt.reason).toBeEqual(original.reason);
            });
        });
    });
});
