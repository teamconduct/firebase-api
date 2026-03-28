import { expect } from '@assertive-ts/core';
import { Team } from '../../src/types/Team';
import { Guid } from '@stevenkellner/typescript-common-functionality';

describe('Team', () => {

    describe('Team.Id', () => {

        describe('Team.Id type', () => {

            it('should create a valid team ID', () => {
                const guidString = Guid.generate().guidString;
                const teamId = Team.Id.builder.build(guidString);
                expect(teamId.value.guidString).toBeEqual(guidString);
            });
        });

        describe('Team.Id.builder', () => {

            it('should build team ID from GUID string', () => {
                const guidString = 'a2345678-1234-4234-1234-123456789abc';
                const teamId = Team.Id.builder.build(guidString);
                expect(teamId.value.guidString).toBeEqual(guidString);
            });

            it('should preserve team ID value', () => {
                const guidString = 'abcdef01-3456-4890-abcd-ef1234567890';
                const teamId = Team.Id.builder.build(guidString);
                expect(teamId.flatten).toBeEqual(guidString);
            });
        });
    });

    describe('Team', () => {

        describe('Team constructor', () => {

            it('should create a team with ID, name, and PayPal link', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const teamSettings = new Team.TeamSettings('https://paypal.me/alphateam', true, 'all-fines', 'public-link-with-approval', 'USD', 'en');
                const team = new Team(teamId, 'Alpha Team', 'https://logo.png', 'Soccer', 'A team for soccer enthusiasts', teamSettings);
                expect(team.id).toBeEqual(teamId);
                expect(team.name).toBeEqual('Alpha Team');
                expect(team.teamLogoUrl).toBeEqual('https://logo.png');
                expect(team.teamSportCategory).toBeEqual('Soccer');
                expect(team.teamDescription).toBeEqual('A team for soccer enthusiasts');
                expect(team.settings).toBeEqual(teamSettings);
            });
        });

        describe('Team.flatten', () => {

            it('should return flattened representation with PayPal link', () => {
                const guidString = 'a1111111-1111-4111-1111-111111111111';
                const teamId = Team.Id.builder.build(guidString);
                const teamSettings = new Team.TeamSettings('https://paypal.me/alphateam', true, 'all-fines', 'public-link-with-approval', 'USD', 'en');
                const team = new Team(teamId, 'Alpha Team', 'https://logo.png', 'Soccer', 'A team for soccer enthusiasts', teamSettings);
                const flattened = team.flatten;
                expect(flattened.id).toBeEqual(guidString);
                expect(flattened.name).toBeEqual('Flatten Team');
                expect(flattened.teamLogoUrl).toBeEqual('https://logo.png');
                expect(flattened.teamSportCategory).toBeEqual('Soccer');
                expect(flattened.teamDescription).toBeEqual('A team for soccer enthusiasts');
                expect(flattened.settings.paypalMeLink).toBeEqual('https://paypal.me/alphateam');
                expect(flattened.settings.allowMembersToAddFines).toBeEqual(true);
                expect(flattened.settings.fineVisibility).toBeEqual('all-fines');
                expect(flattened.settings.joinRequestType).toBeEqual('public-link-with-approval');
                expect(flattened.settings.currency).toBeEqual('USD');
                expect(flattened.settings.locale).toBeEqual('en');
            });

            it('should match the original values', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const name = 'Match Team';
                const teamSettings = new Team.TeamSettings('https://paypal.me/alphateam', true, 'all-fines', 'public-link-with-approval', 'USD', 'en');
                const team = new Team(teamId, 'Alpha Team', 'https://logo.png', 'Soccer', 'A team for soccer enthusiasts', teamSettings);
                const flattened = team.flatten;
                expect(flattened.id).toBeEqual(teamId.flatten);
                expect(flattened.name).toBeEqual(name);
                expect(flattened.teamLogoUrl).toBeEqual('https://logo.png');
                expect(flattened.teamSportCategory).toBeEqual('Soccer');
                expect(flattened.teamDescription).toBeEqual('A team for soccer enthusiasts');
                expect(flattened.settings.paypalMeLink).toBeEqual('https://paypal.me/alphateam');
                expect(flattened.settings.allowMembersToAddFines).toBeEqual(true);
                expect(flattened.settings.fineVisibility).toBeEqual('all-fines');
                expect(flattened.settings.joinRequestType).toBeEqual('public-link-with-approval');
                expect(flattened.settings.currency).toBeEqual('USD');
                expect(flattened.settings.locale).toBeEqual('en');
            });
        });

        describe('Team.TypeBuilder', () => {

            it('should build team from flattened data with PayPal link', () => {
                const flattened = {
                    id: 'a3333333-3333-4333-3333-333333333333',
                    name: 'Built Team',
                    teamLogoUrl: 'https://logo.png',
                    teamSportCategory: 'Basketball',
                    teamDescription: 'A team for basketball enthusiasts',
                    settings: {
                        paypalMeLink: 'https://paypal.me/builtteam',
                        allowMembersToAddFines: false,
                        fineVisibility: 'only-own-fines',
                        joinRequestType: 'invite-only',
                        currency: 'EUR',
                        locale: 'de'
                    }
                } as const;
                const team = Team.builder.build(flattened);
                expect(team.id.value.guidString).toBeEqual('a3333333-3333-4333-3333-333333333333');
                expect(team.name).toBeEqual('Built Team');
                expect(team.teamLogoUrl).toBeEqual('https://logo.png');
                expect(team.teamSportCategory).toBeEqual('Basketball');
                expect(team.teamDescription).toBeEqual('A team for basketball enthusiasts');
                expect(team.settings.paypalMeLink).toBeEqual('https://paypal.me/builtteam');
                expect(team.settings.allowMembersToAddFines).toBeEqual(false);
                expect(team.settings.fineVisibility).toBeEqual('only-own-fines');
                expect(team.settings.joinRequestType).toBeEqual('invite-only');
                expect(team.settings.currency).toBeEqual('EUR');
                expect(team.settings.locale).toBeEqual('de');
            });

            it('should build team from flattened data without PayPal link', () => {
                const flattened = {
                    id: 'a4444444-4444-4444-4444-444444444444',
                    name: 'No Link Team',
                    teamLogoUrl: null,
                    teamSportCategory: null,
                    teamDescription: null,
                    settings: {
                        paypalMeLink: null,
                        allowMembersToAddFines: false,
                        fineVisibility: 'only-own-fines',
                        joinRequestType: 'invite-only',
                        currency: 'EUR',
                        locale: 'de'
                    }
                } as const;
                const team = Team.builder.build(flattened);
                expect(team.id.value.guidString).toBeEqual('a4444444-4444-4444-4444-444444444444');
                expect(team.name).toBeEqual('No Link Team');
                expect(team.teamLogoUrl).toBeNull();
                expect(team.teamSportCategory).toBeNull();
                expect(team.teamDescription).toBeNull();
                expect(team.settings.paypalMeLink).toBeNull();
                expect(team.settings.allowMembersToAddFines).toBeEqual(false);
                expect(team.settings.fineVisibility).toBeEqual('only-own-fines');
                expect(team.settings.joinRequestType).toBeEqual('invite-only');
                expect(team.settings.currency).toBeEqual('EUR');
                expect(team.settings.locale).toBeEqual('de');
            });

            it('should round-trip through flatten and build with PayPal link', () => {
                const teamId = Team.Id.builder.build('a5555555-5555-4555-5555-555555555555');
                const teamSettings = new Team.TeamSettings('https://paypal.me/roundtrip', true, 'all-fines', 'public-link-with-approval', 'USD', 'en');
                const original = new Team(teamId, 'Round Trip Team', 'https://logo.png', 'Tennis', 'A team for tennis enthusiasts', teamSettings);
                const rebuilt = Team.builder.build(original.flatten);
                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.name).toBeEqual(original.name);
                expect(rebuilt.teamLogoUrl).toBeEqual(original.teamLogoUrl);
                expect(rebuilt.teamSportCategory).toBeEqual(original.teamSportCategory);
                expect(rebuilt.teamDescription).toBeEqual(original.teamDescription);
                expect(rebuilt.settings.paypalMeLink).toBeEqual(original.settings.paypalMeLink);
                expect(rebuilt.settings.allowMembersToAddFines).toBeEqual(original.settings.allowMembersToAddFines);
                expect(rebuilt.settings.fineVisibility).toBeEqual(original.settings.fineVisibility);
                expect(rebuilt.settings.joinRequestType).toBeEqual(original.settings.joinRequestType);
                expect(rebuilt.settings.currency).toBeEqual(original.settings.currency);
                expect(rebuilt.settings.locale).toBeEqual(original.settings.locale);
            });
        });
    });
});
