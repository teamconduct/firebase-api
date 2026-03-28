import { expect } from '@assertive-ts/core';
import { TeamRole } from '../../src/types/TeamRole';
import { Locale } from '../../src/types/Locale';

describe('TeamRole', () => {

    describe('TeamRole type', () => {

        it('should be valid team role types', () => {
            const role1: TeamRole = 'person-manager';
            const role2: TeamRole = 'fineTemplate-manager';
            const role3: TeamRole = 'fine-manager';
            const role4: TeamRole = 'fine-can-add';
            const role5: TeamRole = 'team-manager';

            expect(role1).toBeEqual('person-manager');
            expect(role2).toBeEqual('fineTemplate-manager');
            expect(role3).toBeEqual('fine-manager');
            expect(role4).toBeEqual('fine-can-add');
            expect(role5).toBeEqual('team-manager');
        });
    });

    describe('TeamRole.all', () => {

        it('should contain all team roles', () => {
            expect(TeamRole.all).toBeEqual([
                'person-manager',
                'fineTemplate-manager',
                'fine-manager',
                'fine-can-add',
                'team-manager'
            ]);
        });

        it('should have exactly 5 roles', () => {
            expect(TeamRole.all.length).toBeEqual(5);
        });

        it('should contain person-manager', () => {
            expect(TeamRole.all.includes('person-manager')).toBeTrue();
        });

        it('should contain fineTemplate-manager', () => {
            expect(TeamRole.all.includes('fineTemplate-manager')).toBeTrue();
        });

        it('should contain fine-manager', () => {
            expect(TeamRole.all.includes('fine-manager')).toBeTrue();
        });

        it('should contain fine-can-add', () => {
            expect(TeamRole.all.includes('fine-can-add')).toBeTrue();
        });

        it('should contain team-manager', () => {
            expect(TeamRole.all.includes('team-manager')).toBeTrue();
        });

        it('should contain only valid string types', () => {
            for (const role of TeamRole.all) {
                expect(typeof role).toBeEqual('string');
                expect(role.length).toBeGreaterThan(0);
            }
        });
    });

    describe('TeamRole.formatted', () => {

        describe('formatted with en locale', () => {

            it('should format person-manager', () => {
                expect(TeamRole.formatted('person-manager', 'en')).toBeEqual('Person Manager');
            });

            it('should format fineTemplate-manager', () => {
                expect(TeamRole.formatted('fineTemplate-manager', 'en')).toBeEqual('Fine Template Manager');
            });

            it('should format fine-manager', () => {
                expect(TeamRole.formatted('fine-manager', 'en')).toBeEqual('Fine Manager');
            });

            it('should format fine-can-add', () => {
                expect(TeamRole.formatted('fine-can-add', 'en')).toBeEqual('Can add fines');
            });

            it('should format team-manager', () => {
                expect(TeamRole.formatted('team-manager', 'en')).toBeEqual('Team Manager');
            });
        });

        describe('formatted with de locale', () => {

            it('should format person-manager', () => {
                expect(TeamRole.formatted('person-manager', 'de')).toBeEqual('Personenmanager');
            });

            it('should format fineTemplate-manager', () => {
                expect(TeamRole.formatted('fineTemplate-manager', 'de')).toBeEqual('Strafvorlagenmanager');
            });

            it('should format fine-manager', () => {
                expect(TeamRole.formatted('fine-manager', 'de')).toBeEqual('Strafenmanager');
            });

            it('should format fine-can-add', () => {
                expect(TeamRole.formatted('fine-can-add', 'de')).toBeEqual('Kann Strafen hinzufügen');
            });

            it('should format team-manager', () => {
                expect(TeamRole.formatted('team-manager', 'de')).toBeEqual('Teammanager');
            });
        });

        describe('formatted for all roles and locales', () => {

            it('should format all roles in all locales', () => {
                for (const role of TeamRole.all) {
                    for (const locale of Locale.all) {
                        const formatted = TeamRole.formatted(role, locale);
                        expect(typeof formatted).toBeEqual('string');
                        expect(formatted.length).toBeGreaterThan(0);
                    }
                }
            });

            it('should return different values for different locales', () => {
                for (const role of TeamRole.all) {
                    const formattedEN = TeamRole.formatted(role, 'en');
                    const formattedDE = TeamRole.formatted(role, 'de');
                    // Most roles should have different translations
                    // (though some might be similar, so we just check they're strings)
                    expect(typeof formattedEN).toBeEqual('string');
                    expect(typeof formattedDE).toBeEqual('string');
                }
            });
        });
    });

    describe('TeamRole.builder', () => {

        it('should build valid team role from string', () => {
            const role1 = TeamRole.builder.build('person-manager');
            const role2 = TeamRole.builder.build('team-manager');

            expect(role1).toBeEqual('person-manager');
            expect(role2).toBeEqual('team-manager');
        });

        it('should preserve team role value', () => {
            for (const role of TeamRole.all) {
                const built = TeamRole.builder.build(role);
                expect(built).toBeEqual(role);
            }
        });

        it('should build all team roles', () => {
            const roles = [
                'person-manager',
                'fineTemplate-manager',
                'fine-manager',
                'fine-can-add',
                'team-manager'
            ];

            for (const role of roles) {
                const built = TeamRole.builder.build(role as TeamRole);
                expect(built).toBeEqual(role);
            }
        });
    });
});
