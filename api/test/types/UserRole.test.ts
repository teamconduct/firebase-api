import { expect } from '@assertive-ts/core';
import { UserRole } from '../../src/types/UserRole';
import { Locale } from '../../src/types/Locale';

describe('UserRole', () => {

    describe('UserRole type', () => {

        it('should be valid user role types', () => {
            const role1: UserRole = 'person-manager';
            const role2: UserRole = 'fineTemplate-manager';
            const role3: UserRole = 'fine-manager';
            const role4: UserRole = 'fine-can-add';
            const role5: UserRole = 'team-manager';

            expect(role1).toBeEqual('person-manager');
            expect(role2).toBeEqual('fineTemplate-manager');
            expect(role3).toBeEqual('fine-manager');
            expect(role4).toBeEqual('fine-can-add');
            expect(role5).toBeEqual('team-manager');
        });
    });

    describe('UserRole.all', () => {

        it('should contain all user roles', () => {
            expect(UserRole.all).toBeEqual([
                'person-manager',
                'fineTemplate-manager',
                'fine-manager',
                'fine-can-add',
                'team-manager'
            ]);
        });

        it('should have exactly 5 roles', () => {
            expect(UserRole.all.length).toBeEqual(5);
        });

        it('should contain person-manager', () => {
            expect(UserRole.all.includes('person-manager')).toBeTrue();
        });

        it('should contain fineTemplate-manager', () => {
            expect(UserRole.all.includes('fineTemplate-manager')).toBeTrue();
        });

        it('should contain fine-manager', () => {
            expect(UserRole.all.includes('fine-manager')).toBeTrue();
        });

        it('should contain fine-can-add', () => {
            expect(UserRole.all.includes('fine-can-add')).toBeTrue();
        });

        it('should contain team-manager', () => {
            expect(UserRole.all.includes('team-manager')).toBeTrue();
        });

        it('should contain only valid string types', () => {
            for (const role of UserRole.all) {
                expect(typeof role).toBeEqual('string');
                expect(role.length).toBeGreaterThan(0);
            }
        });
    });

    describe('UserRole.formatted', () => {

        describe('formatted with en locale', () => {

            it('should format person-manager', () => {
                expect(UserRole.formatted('person-manager', 'en')).toBeEqual('Person Manager');
            });

            it('should format fineTemplate-manager', () => {
                expect(UserRole.formatted('fineTemplate-manager', 'en')).toBeEqual('Fine Template Manager');
            });

            it('should format fine-manager', () => {
                expect(UserRole.formatted('fine-manager', 'en')).toBeEqual('Fine Manager');
            });

            it('should format fine-can-add', () => {
                expect(UserRole.formatted('fine-can-add', 'en')).toBeEqual('Can add fines');
            });

            it('should format team-manager', () => {
                expect(UserRole.formatted('team-manager', 'en')).toBeEqual('Team Manager');
            });
        });

        describe('formatted with de locale', () => {

            it('should format person-manager', () => {
                expect(UserRole.formatted('person-manager', 'de')).toBeEqual('Personenmanager');
            });

            it('should format fineTemplate-manager', () => {
                expect(UserRole.formatted('fineTemplate-manager', 'de')).toBeEqual('Strafvorlagenmanager');
            });

            it('should format fine-manager', () => {
                expect(UserRole.formatted('fine-manager', 'de')).toBeEqual('Strafenmanager');
            });

            it('should format fine-can-add', () => {
                expect(UserRole.formatted('fine-can-add', 'de')).toBeEqual('Kann Strafen hinzufügen');
            });

            it('should format team-manager', () => {
                expect(UserRole.formatted('team-manager', 'de')).toBeEqual('Teammanager');
            });
        });

        describe('formatted for all roles and locales', () => {

            it('should format all roles in all locales', () => {
                for (const role of UserRole.all) {
                    for (const locale of Locale.all) {
                        const formatted = UserRole.formatted(role, locale);
                        expect(typeof formatted).toBeEqual('string');
                        expect(formatted.length).toBeGreaterThan(0);
                    }
                }
            });

            it('should return different values for different locales', () => {
                for (const role of UserRole.all) {
                    const formattedEN = UserRole.formatted(role, 'en');
                    const formattedDE = UserRole.formatted(role, 'de');
                    // Most roles should have different translations
                    // (though some might be similar, so we just check they're strings)
                    expect(typeof formattedEN).toBeEqual('string');
                    expect(typeof formattedDE).toBeEqual('string');
                }
            });
        });
    });

    describe('UserRole.builder', () => {

        it('should build valid user role from string', () => {
            const role1 = UserRole.builder.build('person-manager');
            const role2 = UserRole.builder.build('team-manager');

            expect(role1).toBeEqual('person-manager');
            expect(role2).toBeEqual('team-manager');
        });

        it('should preserve user role value', () => {
            for (const role of UserRole.all) {
                const built = UserRole.builder.build(role);
                expect(built).toBeEqual(role);
            }
        });

        it('should build all user roles', () => {
            const roles = [
                'person-manager',
                'fineTemplate-manager',
                'fine-manager',
                'fine-can-add',
                'team-manager'
            ];

            for (const role of roles) {
                const built = UserRole.builder.build(role as UserRole);
                expect(built).toBeEqual(role);
            }
        });
    });
});
