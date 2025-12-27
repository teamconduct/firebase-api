import { expect } from '@assertive-ts/core';
import { PersonPrivateProperties } from '../../src/types/PersonPrivateProperties';

describe('PersonPrivateProperties', () => {

    describe('PersonPrivateProperties constructor', () => {

        it('should create properties with first name and last name', () => {
            const props = new PersonPrivateProperties('John', 'Doe');
            expect(props.firstName).toBeEqual('John');
            expect(props.lastName).toBeEqual('Doe');
        });

        it('should create properties with first name only', () => {
            const props = new PersonPrivateProperties('Jane', null);
            expect(props.firstName).toBeEqual('Jane');
            expect(props.lastName).toBeNull();
        });

        it('should create properties with various names', () => {
            const testCases = [
                { firstName: 'Alice', lastName: 'Smith' },
                { firstName: 'Bob', lastName: null },
                { firstName: 'Charlie', lastName: 'Johnson' },
                { firstName: 'Diana', lastName: 'Williams' }
            ];

            testCases.forEach(testCase => {
                const props = new PersonPrivateProperties(testCase.firstName, testCase.lastName);
                expect(props.firstName).toBeEqual(testCase.firstName);
                expect(props.lastName).toBeEqual(testCase.lastName);
            });
        });

        it('should handle names with special characters', () => {
            const props = new PersonPrivateProperties('François', 'O\'Brien');
            expect(props.firstName).toBeEqual('François');
            expect(props.lastName).toBeEqual('O\'Brien');
        });

        it('should handle long names', () => {
            const longFirstName = 'Alexander-Christopher-Maximilian';
            const longLastName = 'Van Der Woodsen-Humphrey-Bass';
            const props = new PersonPrivateProperties(longFirstName, longLastName);
            expect(props.firstName).toBeEqual(longFirstName);
            expect(props.lastName).toBeEqual(longLastName);
        });

        it('should handle empty string as first name', () => {
            const props = new PersonPrivateProperties('', 'Doe');
            expect(props.firstName).toBeEqual('');
            expect(props.lastName).toBeEqual('Doe');
        });
    });

    describe('PersonPrivateProperties.flatten', () => {

        it('should return flattened representation with both names', () => {
            const props = new PersonPrivateProperties('John', 'Smith');
            const flattened = props.flatten;
            expect(flattened.firstName).toBeEqual('John');
            expect(flattened.lastName).toBeEqual('Smith');
        });

        it('should return flattened representation with first name only', () => {
            const props = new PersonPrivateProperties('Jane', null);
            const flattened = props.flatten;
            expect(flattened.firstName).toBeEqual('Jane');
            expect(flattened.lastName).toBeNull();
        });

        it('should match the original values', () => {
            const firstName = 'Michael';
            const lastName = 'Brown';
            const props = new PersonPrivateProperties(firstName, lastName);
            const flattened = props.flatten;
            expect(flattened.firstName).toBeEqual(firstName);
            expect(flattened.lastName).toBeEqual(lastName);
        });

        it('should have correct structure', () => {
            const props = new PersonPrivateProperties('Test', 'User');
            const flattened = props.flatten;
            expect(typeof flattened.firstName).toBeEqual('string');
            expect(typeof flattened.lastName).toBeEqual('string');
        });

        it('should handle null lastName correctly in flattened form', () => {
            const props = new PersonPrivateProperties('Single', null);
            const flattened = props.flatten;
            expect(flattened.lastName).toBeNull();
        });

        it('should preserve special characters in flattened form', () => {
            const props = new PersonPrivateProperties('José', 'García');
            const flattened = props.flatten;
            expect(flattened.firstName).toBeEqual('José');
            expect(flattened.lastName).toBeEqual('García');
        });
    });

    describe('PersonPrivateProperties.TypeBuilder', () => {

        it('should build properties from flattened data with both names', () => {
            const flattened = {
                firstName: 'Emily',
                lastName: 'Davis'
            };
            const props = PersonPrivateProperties.builder.build(flattened);
            expect(props.firstName).toBeEqual('Emily');
            expect(props.lastName).toBeEqual('Davis');
        });

        it('should build properties from flattened data with null lastName', () => {
            const flattened = {
                firstName: 'Oliver',
                lastName: null
            };
            const props = PersonPrivateProperties.builder.build(flattened);
            expect(props.firstName).toBeEqual('Oliver');
            expect(props.lastName).toBeNull();
        });

        it('should round-trip through flatten and build with both names', () => {
            const original = new PersonPrivateProperties('Sophia', 'Wilson');
            const rebuilt = PersonPrivateProperties.builder.build(original.flatten);
            expect(rebuilt.firstName).toBeEqual(original.firstName);
            expect(rebuilt.lastName).toBeEqual(original.lastName);
        });

        it('should round-trip through flatten and build with null lastName', () => {
            const original = new PersonPrivateProperties('Liam', null);
            const rebuilt = PersonPrivateProperties.builder.build(original.flatten);
            expect(rebuilt.firstName).toBeEqual(original.firstName);
            expect(rebuilt.lastName).toBeNull();
        });

        it('should build properties with various names', () => {
            const testCases = [
                { firstName: 'Emma', lastName: 'Taylor' },
                { firstName: 'Noah', lastName: null },
                { firstName: 'Ava', lastName: 'Anderson' },
                { firstName: 'William', lastName: 'Thomas' }
            ];

            testCases.forEach(testCase => {
                const props = PersonPrivateProperties.builder.build(testCase);
                expect(props.firstName).toBeEqual(testCase.firstName);
                expect(props.lastName).toBeEqual(testCase.lastName);
            });
        });

        it('should handle special characters through round-trip', () => {
            const original = new PersonPrivateProperties('Müller', 'O\'Reilly');
            const rebuilt = PersonPrivateProperties.builder.build(original.flatten);
            expect(rebuilt.firstName).toBeEqual('Müller');
            expect(rebuilt.lastName).toBeEqual('O\'Reilly');
        });

        it('should build properties with empty string firstName', () => {
            const flattened = {
                firstName: '',
                lastName: 'Empty'
            };
            const props = PersonPrivateProperties.builder.build(flattened);
            expect(props.firstName).toBeEqual('');
            expect(props.lastName).toBeEqual('Empty');
        });

        it('should preserve exact values through multiple round-trips', () => {
            const original = new PersonPrivateProperties('Isabella', 'Martinez');
            const rebuilt1 = PersonPrivateProperties.builder.build(original.flatten);
            const rebuilt2 = PersonPrivateProperties.builder.build(rebuilt1.flatten);
            const rebuilt3 = PersonPrivateProperties.builder.build(rebuilt2.flatten);

            expect(rebuilt3.firstName).toBeEqual(original.firstName);
            expect(rebuilt3.lastName).toBeEqual(original.lastName);
        });
    });
});
