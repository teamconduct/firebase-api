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
                const team = new Team(teamId, 'Alpha Team', 'https://paypal.me/alphateam');
                expect(team.id).toBeEqual(teamId);
                expect(team.name).toBeEqual('Alpha Team');
                expect(team.paypalMeLink).toBeEqual('https://paypal.me/alphateam');
            });

            it('should create a team without PayPal link', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const team = new Team(teamId, 'Beta Team', null);
                expect(team.id).toBeEqual(teamId);
                expect(team.name).toBeEqual('Beta Team');
                expect(team.paypalMeLink).toBeNull();
            });

            it('should create teams with different names', () => {
                const teamId1 = Team.Id.builder.build(Guid.generate().guidString);
                const teamId2 = Team.Id.builder.build(Guid.generate().guidString);
                const team1 = new Team(teamId1, 'Team One', null);
                const team2 = new Team(teamId2, 'Team Two', 'https://paypal.me/team2');
                expect(team1.name).toBeEqual('Team One');
                expect(team2.name).toBeEqual('Team Two');
            });
        });

        describe('Team.flatten', () => {

            it('should return flattened representation with PayPal link', () => {
                const guidString = 'a1111111-1111-4111-1111-111111111111';
                const teamId = Team.Id.builder.build(guidString);
                const team = new Team(teamId, 'Flatten Team', 'https://paypal.me/flattenteam');
                const flattened = team.flatten;
                expect(flattened.id).toBeEqual(guidString);
                expect(flattened.name).toBeEqual('Flatten Team');
                expect(flattened.paypalMeLink).toBeEqual('https://paypal.me/flattenteam');
            });

            it('should return flattened representation without PayPal link', () => {
                const guidString = 'a2222222-2222-4222-2222-222222222222';
                const teamId = Team.Id.builder.build(guidString);
                const team = new Team(teamId, 'No PayPal Team', null);
                const flattened = team.flatten;
                expect(flattened.id).toBeEqual(guidString);
                expect(flattened.name).toBeEqual('No PayPal Team');
                expect(flattened.paypalMeLink).toBeNull();
            });

            it('should match the original values', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const name = 'Match Team';
                const paypalLink = 'https://paypal.me/match';
                const team = new Team(teamId, name, paypalLink);
                const flattened = team.flatten;
                expect(flattened.id).toBeEqual(teamId.flatten);
                expect(flattened.name).toBeEqual(name);
                expect(flattened.paypalMeLink).toBeEqual(paypalLink);
            });

            it('should have correct structure', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const team = new Team(teamId, 'Structure Team', null);
                const flattened = team.flatten;
                expect(typeof flattened.id).toBeEqual('string');
                expect(typeof flattened.name).toBeEqual('string');
                expect(flattened.paypalMeLink).toBeNull();
            });
        });

        describe('Team.TypeBuilder', () => {

            it('should build team from flattened data with PayPal link', () => {
                const flattened = {
                    id: 'a3333333-3333-4333-3333-333333333333',
                    name: 'Built Team',
                    paypalMeLink: 'https://paypal.me/builtteam'
                };
                const team = Team.builder.build(flattened);
                expect(team.id.value.guidString).toBeEqual('a3333333-3333-4333-3333-333333333333');
                expect(team.name).toBeEqual('Built Team');
                expect(team.paypalMeLink).toBeEqual('https://paypal.me/builtteam');
            });

            it('should build team from flattened data without PayPal link', () => {
                const flattened = {
                    id: 'a4444444-4444-4444-4444-444444444444',
                    name: 'No Link Team',
                    paypalMeLink: null
                };
                const team = Team.builder.build(flattened);
                expect(team.id.value.guidString).toBeEqual('a4444444-4444-4444-4444-444444444444');
                expect(team.name).toBeEqual('No Link Team');
                expect(team.paypalMeLink).toBeNull();
            });

            it('should round-trip through flatten and build with PayPal link', () => {
                const teamId = Team.Id.builder.build('a5555555-5555-4555-5555-555555555555');
                const original = new Team(teamId, 'Round Trip Team', 'https://paypal.me/roundtrip');
                const rebuilt = Team.builder.build(original.flatten);
                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.name).toBeEqual(original.name);
                expect(rebuilt.paypalMeLink).toBeEqual(original.paypalMeLink);
            });

            it('should round-trip through flatten and build without PayPal link', () => {
                const teamId = Team.Id.builder.build('a6666666-6666-4666-6666-666666666666');
                const original = new Team(teamId, 'Null Link Team', null);
                const rebuilt = Team.builder.build(original.flatten);
                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.name).toBeEqual(original.name);
                expect(rebuilt.paypalMeLink).toBeNull();
            });

            it('should build teams with various valid inputs', () => {
                const testCases = [
                    { id: 'a7777777-7777-4777-7777-777777777777', name: 'Test 1', paypalMeLink: 'https://paypal.me/test1' },
                    { id: 'a8888888-8888-4888-8888-888888888888', name: 'Test 2', paypalMeLink: null },
                    { id: 'a9999999-9999-4999-9999-999999999999', name: 'Team with Long Name', paypalMeLink: 'https://paypal.me/longname' }
                ];

                testCases.forEach(testCase => {
                    const team = Team.builder.build(testCase);
                    expect(team.id.value.guidString).toBeEqual(testCase.id);
                    expect(team.name).toBeEqual(testCase.name);
                    expect(team.paypalMeLink).toBeEqual(testCase.paypalMeLink);
                });
            });
        });
    });
});
