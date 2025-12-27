import { expect } from '@assertive-ts/core';
import { Localization, ValueLocalization, PluralLocalization, localizations } from '../../src/types/Localization';
import { Pluralization } from '../../src/types/Pluralization';

describe('Localization', () => {

    describe('localizations', () => {

        it('should contain en and de locales', () => {
            expect(Object.keys(localizations).sort()).toBeEqual(['de', 'en']);
        });

        it('should have en locale', () => {
            expect(localizations.en).not.toBeUndefined();
        });

        it('should have de locale', () => {
            expect(localizations.de).not.toBeUndefined();
        });
    });

    describe('Localization.shared', () => {

        it('should return localization for en locale', () => {
            const localization = Localization.shared('en');
            expect(localization).not.toBeUndefined();
        });

        it('should return localization for de locale', () => {
            const localization = Localization.shared('de');
            expect(localization).not.toBeUndefined();
        });

        it('should return different instances for different locales', () => {
            const localizationEN = Localization.shared('en');
            const localizationDE = Localization.shared('de');
            expect(localizationEN).not.toBe(localizationDE);
        });

        it('should access notification.fine.new.title', () => {
            const localization = Localization.shared('en');
            expect(localization.notification.fine.new.title).toBeInstanceOf(ValueLocalization);
        });

        it('should access nested localization values', () => {
            const localization = Localization.shared('en');
            expect(localization.payedState.payed).toBeInstanceOf(ValueLocalization);
        });
    });
});

describe('ValueLocalization', () => {

    describe('ValueLocalization constructor', () => {

        it('should create instance with simple string', () => {
            const localization = new ValueLocalization('Hello World');
            expect(localization.value()).toBeEqual('Hello World');
        });

        it('should create instance with template string', () => {
            const localization = new ValueLocalization('Hello {{name}}');
            expect(localization.value({ name: 'World' })).toBeEqual('Hello World');
        });
    });

    describe('ValueLocalization.value without variables', () => {

        it('should return simple string without changes', () => {
            const localization = new ValueLocalization('Simple text');
            expect(localization.value()).toBeEqual('Simple text');
        });

        it('should return string with special characters', () => {
            const localization = new ValueLocalization('Text with !@#$%^&*()');
            expect(localization.value()).toBeEqual('Text with !@#$%^&*()');
        });

        it('should work with empty string', () => {
            const localization = new ValueLocalization('');
            expect(localization.value()).toBeEqual('');
        });
    });

    describe('ValueLocalization.value with single variable', () => {

        it('should replace single variable', () => {
            const localization = new ValueLocalization('Hello {{name}}');
            expect(localization.value({ name: 'Alice' })).toBeEqual('Hello Alice');
        });

        it('should replace variable at start', () => {
            const localization = new ValueLocalization('{{greeting}} World');
            expect(localization.value({ greeting: 'Hello' })).toBeEqual('Hello World');
        });

        it('should replace variable at end', () => {
            const localization = new ValueLocalization('Hello {{name}}');
            expect(localization.value({ name: 'Bob' })).toBeEqual('Hello Bob');
        });

        it('should replace variable in middle', () => {
            const localization = new ValueLocalization('Hello {{name}}, welcome!');
            expect(localization.value({ name: 'Charlie' })).toBeEqual('Hello Charlie, welcome!');
        });
    });

    describe('ValueLocalization.value with multiple variables', () => {

        it('should replace two variables', () => {
            const localization = new ValueLocalization('{{greeting}} {{name}}');
            expect(localization.value({ greeting: 'Hello', name: 'World' })).toBeEqual('Hello World');
        });

        it('should replace three variables', () => {
            const localization = new ValueLocalization('{{a}} {{b}} {{c}}');
            expect(localization.value({ a: 'One', b: 'Two', c: 'Three' })).toBeEqual('One Two Three');
        });

        it('should replace variables with text between', () => {
            const localization = new ValueLocalization('User {{name}} has {{count}} items');
            expect(localization.value({ name: 'Alice', count: '5' })).toBeEqual('User Alice has 5 items');
        });
    });

    describe('ValueLocalization.value with same variable multiple times', () => {

        it('should replace same variable twice', () => {
            const localization = new ValueLocalization('{{name}} said: Hello {{name}}');
            expect(localization.value({ name: 'Bob' })).toBeEqual('Bob said: Hello Bob');
        });

        it('should replace same variable three times', () => {
            const localization = new ValueLocalization('{{x}} + {{x}} = {{x}}');
            expect(localization.value({ x: '2' })).toBeEqual('2 + 2 = 2');
        });
    });

    describe('ValueLocalization.value error handling', () => {

        it('should throw error when variable is missing', () => {
            const localization = new ValueLocalization('Hello {{name}}');
            expect(() => localization.value()).toThrow();
        });

        it('should throw error with message about missing key', () => {
            const localization = new ValueLocalization('Hello {{name}}');
            try {
                localization.value();
                expect(false).toBeTrue(); // Should not reach here
            } catch (error) {
                expect((error as Error).message).toContain('Missing argument for key: name');
            }
        });

        it('should throw error when one of multiple variables is missing', () => {
            const localization = new ValueLocalization('{{greeting}} {{name}}');
            expect(() => localization.value({ greeting: 'Hello' })).toThrow();
        });
    });

    describe('ValueLocalization.value with extra arguments', () => {

        it('should ignore extra arguments', () => {
            const localization = new ValueLocalization('Hello {{name}}');
            expect(localization.value({ name: 'World', extra: 'ignored' })).toBeEqual('Hello World');
        });

        it('should work with only extra arguments for no-variable string', () => {
            const localization = new ValueLocalization('Hello World');
            expect(localization.value({ extra: 'ignored' })).toBeEqual('Hello World');
        });
    });
});

describe('PluralLocalization', () => {

    describe('PluralLocalization constructor', () => {

        it('should create instance with Pluralization', () => {
            const pluralization = new Pluralization({
                one: 'one item',
                other: '{{count}} items'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(1)).toBeEqual('one item');
        });
    });

    describe('PluralLocalization.value with count', () => {

        it('should return singular form for count = 1', () => {
            const pluralization = new Pluralization({
                one: 'one item',
                other: '{{count}} items'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(1)).toBeEqual('one item');
        });

        it('should return plural form for count = 0', () => {
            const pluralization = new Pluralization({
                one: 'one item',
                other: '{{count}} items'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(0)).toBeEqual('0 items');
        });

        it('should return plural form for count = 5', () => {
            const pluralization = new Pluralization({
                one: 'one item',
                other: '{{count}} items'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(5)).toBeEqual('5 items');
        });
    });

    describe('PluralLocalization.value with count variable', () => {

        it('should automatically include count in template', () => {
            const pluralization = new Pluralization({
                other: 'Total: {{count}}'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(42)).toBeEqual('Total: 42');
        });

        it('should use count in plural form', () => {
            const pluralization = new Pluralization({
                one: '{{count}} message',
                other: '{{count}} messages'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(1)).toBeEqual('1 message');
            expect(localization.value(5)).toBeEqual('5 messages');
        });
    });

    describe('PluralLocalization.value with additional arguments', () => {

        it('should combine count with additional arguments', () => {
            const pluralization = new Pluralization({
                other: '{{name}} has {{count}} items'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(5, { name: 'Alice' })).toBeEqual('Alice has 5 items');
        });

        it('should use all provided arguments', () => {
            const pluralization = new Pluralization({
                one: '{{user}} has {{count}} {{type}}',
                other: '{{user}} has {{count}} {{type}}s'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(1, { user: 'Bob', type: 'file' })).toBeEqual('Bob has 1 file');
            expect(localization.value(3, { user: 'Bob', type: 'file' })).toBeEqual('Bob has 3 files');
        });
    });

    describe('PluralLocalization.value with complex pluralization', () => {

        it('should work with zero form', () => {
            const pluralization = new Pluralization({
                zero: 'no items',
                one: 'one item',
                other: '{{count}} items'
            });
            const localization = new PluralLocalization(pluralization);
            expect(localization.value(0)).toBeEqual('no items');
        });

        it('should work with all plural forms', () => {
            const pluralization = new Pluralization({
                zero: 'zero',
                one: 'one',
                two: 'two',
                few: 'few ({{count}})',
                many: 'many ({{count}})',
                other: 'other ({{count}})'
            });
            const localization = new PluralLocalization(pluralization);

            expect(localization.value(0)).toBeEqual('zero');
            expect(localization.value(1)).toBeEqual('one');
            expect(localization.value(2)).toBeEqual('two');
            expect(localization.value(3)).toBeEqual('few (3)');
            expect(localization.value(10)).toBeEqual('many (10)');
            expect(localization.value(100)).toBeEqual('other (100)');
        });
    });
});
