import { expect } from '@assertive-ts/core';
import { Person } from '../../src/types/Person';
import { PersonProperties } from '../../src/types/PersonProperties';
import { PersonSignInProperties } from '../../src/types/PersonSignInProperties';
import { NotificationProperties } from '../../src/types/NotificationProperties';
import { Fine } from '../../src/types/Fine';
import { Guid, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { User } from '../../src/types/User';

describe('Person', () => {

    describe('Person.Id', () => {

        describe('Person.Id type', () => {

            it('should create a valid person ID', () => {
                const guid = new Guid('a1234567-89ab-4def-0123-456789abcdef');
                const personId = Person.Id.builder.build(guid.guidString);
                expect(personId.value).toBeEqual(guid);
            });
        });

        describe('Person.Id.builder', () => {

            it('should build person ID from GUID string', () => {
                const guidString = 'a1234567-89ab-4def-0123-456789abcdef';
                const personId = Person.Id.builder.build(guidString);
                expect(personId.flatten).toBeEqual(guidString);
            });

            it('should preserve person ID value', () => {
                const guidString = 'b2345678-9abc-4ef0-1234-56789abcdef0';
                const personId = Person.Id.builder.build(guidString);
                expect(personId.flatten).toBeEqual(guidString);
            });
        });
    });

    describe('Person', () => {

        describe('Person constructor', () => {

            it('should create a person with all properties', () => {
                const userId = User.Id.builder.build('u1234567-89ab-4def-0123-456789abcdef');
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('John', 'Doe');
                const fineIds = [Fine.Id.builder.build('b2222222-2222-4222-2222-222222222222')];
                const signInProperties = new PersonSignInProperties(
                    userId,
                    UtcDate.now,
                    new NotificationProperties(),
                    []
                );

                const person = new Person(personId, properties, fineIds, signInProperties);
                expect(person.id).toBeEqual(personId);
                expect(person.properties).toBeEqual(properties);
                expect(person.fineIds.length).toBeEqual(1);
                expect(person.signInProperties).toBeEqual(signInProperties);
            });

            it('should create a person with default empty fineIds', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Jane', null);

                const person = new Person(personId, properties);
                expect(person.fineIds.length).toBeEqual(0);
                expect(person.signInProperties).toBeEqual(null);
            });

            it('should create a person without sign-in properties', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Alice', 'Smith');
                const fineIds: Fine.Id[] = [];

                const person = new Person(personId, properties, fineIds, null);
                expect(person.signInProperties).toBeEqual(null);
            });

            it('should create a person with multiple fines', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Bob', null);
                const fineIds = [
                    Fine.Id.builder.build('b2222222-2222-4222-2222-222222222222'),
                    Fine.Id.builder.build('c3333333-3333-4333-3333-333333333333'),
                    Fine.Id.builder.build('d4444444-4444-4444-4444-444444444444')
                ];

                const person = new Person(personId, properties, fineIds);
                expect(person.fineIds.length).toBeEqual(3);
            });

            it('should handle person with only first name', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Charlie', null);

                const person = new Person(personId, properties);
                expect(person.properties.lastName).toBeEqual(null);
            });
        });

        describe('Person.name', () => {

            it('should return full name when last name is present', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('John', 'Doe');
                const person = new Person(personId, properties);

                expect(person.name).toBeEqual('John Doe');
            });

            it('should return only first name when last name is null', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Jane', null);
                const person = new Person(personId, properties);

                expect(person.name).toBeEqual('Jane');
            });

            it('should handle names with special characters', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('José', 'García');
                const person = new Person(personId, properties);

                expect(person.name).toBeEqual('José García');
            });

            it('should format name correctly with spaces', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Alice', 'Smith');
                const person = new Person(personId, properties);

                const nameParts = person.name.split(' ');
                expect(nameParts.length).toBeEqual(2);
                expect(nameParts[0]).toBeEqual('Alice');
                expect(nameParts[1]).toBeEqual('Smith');
            });
        });

        describe('Person.flatten', () => {

            it('should return flattened representation with all properties', () => {
                const userId = User.Id.builder.build('u1234567-89ab-4def-0123-456789abcdef');
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('John', 'Doe');
                const fineIds = [Fine.Id.builder.build('b2222222-2222-4222-2222-222222222222')];
                const signInProperties = new PersonSignInProperties(
                    userId,
                    UtcDate.now,
                    new NotificationProperties(),
                    []
                );

                const person = new Person(personId, properties, fineIds, signInProperties);
                const flattened = person.flatten;

                expect(flattened.id).toBeEqual(personId.flatten);
                expect(flattened.properties.firstName).toBeEqual('John');
                expect(flattened.properties.lastName).toBeEqual('Doe');
                expect(flattened.fineIds.length).toBeEqual(1);
                expect(flattened.signInProperties).not.toBeEqual(null);
            });

            it('should return flattened representation with null sign-in properties', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Jane', null);

                const person = new Person(personId, properties);
                const flattened = person.flatten;

                expect(flattened.signInProperties).toBeEqual(null);
            });

            it('should flatten empty fineIds array', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Alice', 'Smith');

                const person = new Person(personId, properties, []);
                const flattened = person.flatten;

                expect(flattened.fineIds.length).toBeEqual(0);
                expect(Array.isArray(flattened.fineIds)).toBeTrue();
            });

            it('should flatten multiple fineIds', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Bob', null);
                const fineIds = [
                    Fine.Id.builder.build('b2222222-2222-4222-2222-222222222222'),
                    Fine.Id.builder.build('c3333333-3333-4333-3333-333333333333')
                ];

                const person = new Person(personId, properties, fineIds);
                const flattened = person.flatten;

                expect(flattened.fineIds.length).toBeEqual(2);
                expect(flattened.fineIds[0]).toBeEqual('b2222222-2222-4222-2222-222222222222');
                expect(flattened.fineIds[1]).toBeEqual('c3333333-3333-4333-3333-333333333333');
            });

            it('should have correct structure', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Charlie', 'Brown');
                const person = new Person(personId, properties);
                const flattened = person.flatten;

                expect(typeof flattened.id).toBeEqual('string');
                expect(typeof flattened.properties).toBeEqual('object');
                expect(Array.isArray(flattened.fineIds)).toBeTrue();
            });
        });

        describe('Person.TypeBuilder', () => {

            it('should build person from flattened data with all properties', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    properties: {
                        firstName: 'John',
                        lastName: 'Doe'
                    },
                    fineIds: ['b2222222-2222-4222-2222-222222222222'],
                    signInProperties: {
                        userId: 'user-123',
                        joinDate: UtcDate.now.flatten,
                        notificationProperties: {
                            tokens: {},
                            subscriptions: []
                        },
                        roles: []
                    }
                };

                const person = Person.builder.build(flattened);
                expect(person.id.flatten).toBeEqual(flattened.id);
                expect(person.properties.firstName).toBeEqual('John');
                expect(person.fineIds.length).toBeEqual(1);
                expect(person.signInProperties).not.toBeEqual(null);
            });

            it('should build person from flattened data with null sign-in properties', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    properties: {
                        firstName: 'Jane',
                        lastName: null
                    },
                    fineIds: [],
                    signInProperties: null
                };

                const person = Person.builder.build(flattened);
                expect(person.signInProperties).toBeEqual(null);
            });

            it('should build person with empty fineIds array', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    properties: {
                        firstName: 'Alice',
                        lastName: 'Smith'
                    },
                    fineIds: [],
                    signInProperties: null
                };

                const person = Person.builder.build(flattened);
                expect(person.fineIds.length).toBeEqual(0);
            });

            it('should build person with multiple fineIds', () => {
                const flattened = {
                    id: 'a1111111-1111-4111-1111-111111111111',
                    properties: {
                        firstName: 'Bob',
                        lastName: null
                    },
                    fineIds: [
                        'b2222222-2222-4222-2222-222222222222',
                        'c3333333-3333-4333-3333-333333333333',
                        'd4444444-4444-4444-4444-444444444444'
                    ],
                    signInProperties: null
                };

                const person = Person.builder.build(flattened);
                expect(person.fineIds.length).toBeEqual(3);
            });

            it('should round-trip through flatten and build with all properties', () => {
                const userId = User.Id.builder.build('u1234567-89ab-4def-0123-456789abcdef');
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('John', 'Doe');
                const fineIds = [Fine.Id.builder.build('b2222222-2222-4222-2222-222222222222')];
                const signInProperties = new PersonSignInProperties(
                    userId,
                    UtcDate.now,
                    new NotificationProperties(),
                    []
                );

                const original = new Person(personId, properties, fineIds, signInProperties);
                const rebuilt = Person.builder.build(original.flatten);

                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.properties.firstName).toBeEqual(original.properties.firstName);
                expect(rebuilt.properties.lastName).toBeEqual(original.properties.lastName);
                expect(rebuilt.fineIds.length).toBeEqual(original.fineIds.length);
                expect(rebuilt.signInProperties).not.toBeEqual(null);
            });

            it('should round-trip through flatten and build with null sign-in properties', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Jane', null);

                const original = new Person(personId, properties);
                const rebuilt = Person.builder.build(original.flatten);

                expect(rebuilt.signInProperties).toBeEqual(null);
            });

            it('should round-trip through flatten and build with empty fineIds', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Alice', 'Smith');

                const original = new Person(personId, properties, []);
                const rebuilt = Person.builder.build(original.flatten);

                expect(rebuilt.fineIds.length).toBeEqual(0);
            });

            it('should preserve name property through round-trip', () => {
                const personId = Person.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const properties = new PersonProperties('Charlie', 'Brown');

                const original = new Person(personId, properties);
                const rebuilt = Person.builder.build(original.flatten);

                expect(rebuilt.name).toBeEqual(original.name);
            });
        });
    });
});
