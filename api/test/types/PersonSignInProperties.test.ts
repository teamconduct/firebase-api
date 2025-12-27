import { expect } from '@assertive-ts/core';
import { PersonSignInProperties } from '../../src/types/PersonSignInProperties';
import { User } from '../../src/types/User';
import { NotificationProperties } from '../../src/types/NotificationProperties';
import { UserRole } from '../../src/types/UserRole';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

describe('PersonSignInProperties', () => {

    describe('PersonSignInProperties constructor', () => {

        it('should create sign-in properties with all parameters', () => {
            const userId = User.Id.builder.build('user-123');
            const signInDate = UtcDate.now;
            const notificationProperties = new NotificationProperties();
            const roles: UserRole[] = ['person-manager', 'fine-manager'];

            const props = new PersonSignInProperties(userId, signInDate, notificationProperties, roles);

            expect(props.userId).toBeEqual(userId);
            expect(props.signInDate).toBeEqual(signInDate);
            expect(props.notificationProperties).toBeEqual(notificationProperties);
            expect(props.roles.length).toBeEqual(2);
        });

        it('should create sign-in properties with default notification properties and empty roles', () => {
            const userId = User.Id.builder.build('user-456');
            const signInDate = UtcDate.now;

            const props = new PersonSignInProperties(userId, signInDate);

            expect(props.userId).toBeEqual(userId);
            expect(props.signInDate).toBeEqual(signInDate);
            expect(props.notificationProperties).not.toBeUndefined();
            expect(props.roles.length).toBeEqual(0);
        });

        it('should create sign-in properties with custom notification properties but no roles', () => {
            const userId = User.Id.builder.build('user-789');
            const signInDate = UtcDate.now;
            const notificationProperties = new NotificationProperties();

            const props = new PersonSignInProperties(userId, signInDate, notificationProperties);

            expect(props.notificationProperties).toBeEqual(notificationProperties);
            expect(props.roles.length).toBeEqual(0);
        });

        it('should create sign-in properties with multiple roles', () => {
            const userId = User.Id.builder.build('user-multi');
            const signInDate = UtcDate.now;
            const roles: UserRole[] = ['person-manager', 'fineTemplate-manager', 'fine-manager', 'team-manager'];

            const props = new PersonSignInProperties(userId, signInDate, new NotificationProperties(), roles);

            expect(props.roles.length).toBeEqual(4);
            expect(props.roles.includes('person-manager')).toBeTrue();
            expect(props.roles.includes('team-manager')).toBeTrue();
        });

        it('should create sign-in properties with different sign-in dates', () => {
            const userId = User.Id.builder.build('user-date');
            const date1 = UtcDate.now;
            const date2 = UtcDate.now;

            const props1 = new PersonSignInProperties(userId, date1);
            const props2 = new PersonSignInProperties(userId, date2);

            // Both should have valid dates
            expect(props1.signInDate).not.toBeUndefined();
            expect(props2.signInDate).not.toBeUndefined();
        });
    });

    describe('PersonSignInProperties.flatten', () => {

        it('should return flattened representation with all properties', () => {
            const userId = User.Id.builder.build('user-flat-1');
            const signInDate = UtcDate.now;
            const notificationProperties = new NotificationProperties();
            const roles: UserRole[] = ['fine-manager', 'fine-can-add'];

            const props = new PersonSignInProperties(userId, signInDate, notificationProperties, roles);
            const flattened = props.flatten;

            expect(flattened.userId).toBeEqual('user-flat-1');
            expect(flattened.signInDate).toBeEqual(signInDate.flatten);
            expect(flattened.notificationProperties).not.toBeUndefined();
            expect(flattened.roles.length).toBeEqual(2);
        });

        it('should return flattened representation with default values', () => {
            const userId = User.Id.builder.build('user-flat-2');
            const signInDate = UtcDate.now;

            const props = new PersonSignInProperties(userId, signInDate);
            const flattened = props.flatten;

            expect(flattened.userId).toBeEqual('user-flat-2');
            expect(flattened.notificationProperties).not.toBeUndefined();
            expect(flattened.roles.length).toBeEqual(0);
        });

        it('should match the original values', () => {
            const userId = User.Id.builder.build('user-match');
            const signInDate = UtcDate.now;
            const roles: UserRole[] = ['person-manager'];

            const props = new PersonSignInProperties(userId, signInDate, new NotificationProperties(), roles);
            const flattened = props.flatten;

            expect(flattened.userId).toBeEqual(userId.flatten);
            expect(flattened.signInDate).toBeEqual(signInDate.flatten);
            expect(flattened.roles).toBeEqual(roles);
        });

        it('should have correct structure', () => {
            const userId = User.Id.builder.build('user-struct');
            const signInDate = UtcDate.now;

            const props = new PersonSignInProperties(userId, signInDate);
            const flattened = props.flatten;

            expect(typeof flattened.userId).toBeEqual('string');
            expect(typeof flattened.signInDate).toBeEqual('string');
            expect(typeof flattened.notificationProperties).toBeEqual('object');
            expect(Array.isArray(flattened.roles)).toBeTrue();
        });

        it('should flatten roles array correctly', () => {
            const userId = User.Id.builder.build('user-roles');
            const signInDate = UtcDate.now;
            const roles: UserRole[] = ['person-manager', 'fine-manager', 'team-manager'];

            const props = new PersonSignInProperties(userId, signInDate, new NotificationProperties(), roles);
            const flattened = props.flatten;

            expect(flattened.roles.length).toBeEqual(3);
            expect(flattened.roles[0]).toBeEqual('person-manager');
            expect(flattened.roles[1]).toBeEqual('fine-manager');
            expect(flattened.roles[2]).toBeEqual('team-manager');
        });
    });

    describe('PersonSignInProperties.TypeBuilder', () => {

        it('should build sign-in properties from flattened data with all fields', () => {
            const flattened = {
                userId: 'user-build-1',
                signInDate: UtcDate.now.flatten,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                },
                roles: ['person-manager', 'fine-manager'] as UserRole[]
            };

            const props = PersonSignInProperties.builder.build(flattened);

            expect(props.userId.flatten).toBeEqual('user-build-1');
            expect(props.roles.length).toBeEqual(2);
            expect(props.roles[0]).toBeEqual('person-manager');
        });

        it('should build sign-in properties from flattened data with empty roles', () => {
            const flattened = {
                userId: 'user-build-2',
                signInDate: UtcDate.now.flatten,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                },
                roles: [] as UserRole[]
            };

            const props = PersonSignInProperties.builder.build(flattened);

            expect(props.userId.flatten).toBeEqual('user-build-2');
            expect(props.roles.length).toBeEqual(0);
        });

        it('should build sign-in properties with various roles', () => {
            const flattened = {
                userId: 'user-build-3',
                signInDate: UtcDate.now.flatten,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                },
                roles: ['person-manager', 'fineTemplate-manager', 'fine-can-add', 'team-manager'] as UserRole[]
            };

            const props = PersonSignInProperties.builder.build(flattened);

            expect(props.roles.length).toBeEqual(4);
            expect(props.roles.includes('person-manager')).toBeTrue();
            expect(props.roles.includes('team-manager')).toBeTrue();
        });

        it('should round-trip through flatten and build', () => {
            const userId = User.Id.builder.build('user-round');
            const signInDate = UtcDate.now;
            const roles: UserRole[] = ['fine-manager', 'fine-can-add'];

            const original = new PersonSignInProperties(userId, signInDate, new NotificationProperties(), roles);
            const rebuilt = PersonSignInProperties.builder.build(original.flatten);

            expect(rebuilt.userId.flatten).toBeEqual(original.userId.flatten);
            expect(rebuilt.signInDate.flatten).toBeEqual(original.signInDate.flatten);
            expect(rebuilt.roles.length).toBeEqual(original.roles.length);
            expect(rebuilt.roles).toBeEqual(original.roles);
        });

        it('should round-trip through flatten and build with empty roles', () => {
            const userId = User.Id.builder.build('user-round-empty');
            const signInDate = UtcDate.now;

            const original = new PersonSignInProperties(userId, signInDate);
            const rebuilt = PersonSignInProperties.builder.build(original.flatten);

            expect(rebuilt.userId.flatten).toBeEqual(original.userId.flatten);
            expect(rebuilt.roles.length).toBeEqual(0);
        });

        it('should preserve notification properties through round-trip', () => {
            const userId = User.Id.builder.build('user-notif');
            const signInDate = UtcDate.now;
            const notificationProperties = new NotificationProperties();

            const original = new PersonSignInProperties(userId, signInDate, notificationProperties, []);
            const rebuilt = PersonSignInProperties.builder.build(original.flatten);

            expect(rebuilt.notificationProperties).not.toBeUndefined();
            expect(rebuilt.notificationProperties.tokens.values.length).toBeEqual(0);
            expect(rebuilt.notificationProperties.subscriptions.length).toBeEqual(0);
        });

        it('should build with different date values', () => {
            const testDateStrings = [
                '2020-01-01T00:00:00.000Z',
                '2024-06-15T12:30:45.000Z',
                '2025-12-31T23:59:59.000Z'
            ];

            testDateStrings.forEach(dateString => {
                const flattened = {
                    userId: 'user-date-test',
                    signInDate: dateString,
                    notificationProperties: {
                        tokens: {},
                        subscriptions: []
                    },
                    roles: [] as UserRole[]
                };

                const props = PersonSignInProperties.builder.build(flattened);
                expect(props.signInDate).not.toBeUndefined();
                expect(typeof props.signInDate.flatten).toBeEqual('string');
            });
        });
    });
});
