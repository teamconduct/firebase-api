import { expect } from '@assertive-ts/core';
import { User } from '../../src/types/User';
import { Team } from '../../src/types/Team';
import { Person } from '../../src/types/Person';
import { Dictionary, Guid } from '@stevenkellner/typescript-common-functionality';

describe('User', () => {

    describe('User.Id', () => {

        describe('User.Id type', () => {

            it('should create a valid user ID', () => {
                const userId = User.Id.builder.build('user-123');
                expect(userId.value).toBeEqual('user-123');
            });
        });

        describe('User.Id.builder', () => {

            it('should build user ID from string', () => {
                const userId = User.Id.builder.build('test-user-id');
                expect(userId.value).toBeEqual('test-user-id');
            });

            it('should preserve user ID value', () => {
                const originalId = 'abc-def-123';
                const userId = User.Id.builder.build(originalId);
                expect(userId.flatten).toBeEqual(originalId);
            });
        });
    });

    describe('User.TeamProperties', () => {

        describe('User.TeamProperties constructor', () => {

            it('should create team properties with team name and person ID', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teamProperties = new User.TeamProperties(teamId, 'Team Alpha', personId);
                expect(teamProperties.teamId).toBeEqual(teamId);
                expect(teamProperties.teamName).toBeEqual('Team Alpha');
                expect(teamProperties.personId).toBeEqual(personId);
            });
        });

        describe('User.TeamProperties.flatten', () => {

            it('should return flattened representation', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teamProperties = new User.TeamProperties(teamId, 'Team Beta', personId);
                const flattened = teamProperties.flatten;
                expect(flattened.teamId).toBeEqual(teamId.guidString);
                expect(flattened.teamName).toBeEqual('Team Beta');
                expect(flattened.personId).toBeEqual(personId.guidString);
            });

            it('should match the original values', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teamName = 'Team Gamma';
                const teamProperties = new User.TeamProperties(teamId, teamName, personId);
                const flattened = teamProperties.flatten;
                expect(flattened.teamId).toBeEqual(teamId.flatten);
                expect(flattened.teamName).toBeEqual(teamName);
                expect(flattened.personId).toBeEqual(personId.flatten);
            });

            it('should have correct structure', () => {
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teamProperties = new User.TeamProperties(teamId, 'Team Delta', personId);
                const flattened = teamProperties.flatten;
                expect(typeof flattened.teamId).toBeEqual('string');
                expect(typeof flattened.teamName).toBeEqual('string');
                expect(typeof flattened.personId).toBeEqual('string');
            });
        });

        describe('User.TeamProperties.TypeBuilder', () => {

            it('should build team properties from flattened data', () => {
                const flattened = {
                    teamId: '87654321-4321-4321-4321-210987654321',
                    teamName: 'Team Epsilon',
                    personId: '12345678-1234-4234-1234-123456789012'
                };
                const teamProperties = User.TeamProperties.builder.build(flattened);
                expect(teamProperties.teamId.value.guidString).toBeEqual('87654321-4321-4321-4321-210987654321');
                expect(teamProperties.teamName).toBeEqual('Team Epsilon');
                expect(teamProperties.personId.value.guidString).toBeEqual('12345678-1234-4234-1234-123456789012');
            });

            it('should round-trip through flatten and build', () => {
                const teamId = Team.Id.builder.build('12345678-1234-4234-1234-123456789012');
                const personId = Person.Id.builder.build('87654321-4321-4321-4321-210987654321');
                const original = new User.TeamProperties(teamId, 'Team Zeta', personId);
                const rebuilt = User.TeamProperties.builder.build(original.flatten);
                expect(rebuilt.teamId.flatten).toBeEqual(original.teamId.flatten);
                expect(rebuilt.teamName).toBeEqual(original.teamName);
                expect(rebuilt.personId.flatten).toBeEqual(original.personId.flatten);
            });
        });
    });

    describe('User', () => {

        describe('User constructor', () => {

            it('should create a user with ID and empty teams dictionary', () => {
                const userId = User.Id.builder.build('user-001');
                const user = new User(userId);
                expect(user.id).toBeEqual(userId);
                expect(user.teams.values.length).toBeEqual(0);
            });

            it('should create a user with ID and teams', () => {
                const userId = User.Id.builder.build('user-002');
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teamProperties = new User.TeamProperties(teamId, 'Team A', personId);
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, teamProperties);

                const user = new User(userId, teams);
                expect(user.id).toBeEqual(userId);
                expect(user.teams.values.length).toBeEqual(1);
                expect(user.teams.get(teamId)?.teamName).toBeEqual('Team A');
            });

            it('should create a user with multiple teams', () => {
                const userId = User.Id.builder.build('user-003');
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);

                const teamId1 = Team.Id.builder.build(Guid.generate().guidString);
                const personId1 = Person.Id.builder.build(Guid.generate().guidString);
                teams.set(teamId1, new User.TeamProperties(teamId1, 'Team One', personId1));

                const teamId2 = Team.Id.builder.build(Guid.generate().guidString);
                const personId2 = Person.Id.builder.build(Guid.generate().guidString);
                teams.set(teamId2, new User.TeamProperties(teamId2, 'Team Two', personId2));
                const user = new User(userId, teams);
                expect(user.teams.values.length).toBeEqual(2);
            });
        });

        describe('User.flatten', () => {

            it('should return flattened representation with empty teams', () => {
                const userId = User.Id.builder.build('user-flat-001');
                const user = new User(userId);
                const flattened = user.flatten;
                expect(flattened.id).toBeEqual('user-flat-001');
                expect(Object.keys(flattened.teams)).toBeEqual([]);
            });

            it('should return flattened representation with teams', () => {
                const userId = User.Id.builder.build('user-flat-002');
                const teamId = Team.Id.builder.build('11111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('22222222-2222-4222-2222-222222222222');
                const teamProperties = new User.TeamProperties(teamId, 'Team Flatten', personId);
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, teamProperties);

                const user = new User(userId, teams);
                const flattened = user.flatten;
                expect(flattened.id).toBeEqual('user-flat-002');
                expect(flattened.teams['11111111-1111-4111-1111-111111111111']).not.toBeUndefined();
                expect(flattened.teams['11111111-1111-4111-1111-111111111111'].teamName).toBeEqual('Team Flatten');
            });

            it('should match the original values', () => {
                const userId = User.Id.builder.build('user-match-001');
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, new User.TeamProperties(teamId, 'Match Team', personId));

                const user = new User(userId, teams);
                const flattened = user.flatten;
                expect(flattened.id).toBeEqual(userId.flatten);
            });

            it('should have correct structure', () => {
                const userId = User.Id.builder.build('user-struct-001');
                const user = new User(userId);
                const flattened = user.flatten;
                expect(typeof flattened.id).toBeEqual('string');
                expect(typeof flattened.teams).toBeEqual('object');
            });
        });

        describe('User.TypeBuilder', () => {

            it('should build user from flattened data with empty teams', () => {
                const flattened = {
                    id: 'user-build-001',
                    teams: {}
                };
                const user = User.builder.build(flattened);
                expect(user.id.flatten).toBeEqual('user-build-001');
                expect(user.teams.values.length).toBeEqual(0);
            });

            it('should build user from flattened data with teams', () => {
                const flattened = {
                    id: 'user-build-002',
                    teams: {
                        '33333333-3333-4333-3333-333333333333': {
                            teamId: '33333333-3333-4333-3333-333333333333',
                            teamName: 'Built Team',
                            personId: '44444444-4444-4444-4444-444444444444'
                        }
                    }
                };
                const user = User.builder.build(flattened);
                expect(user.id.flatten).toBeEqual('user-build-002');
                expect(user.teams.values.length).toBeEqual(1);
                const teamId = Team.Id.builder.build('33333333-3333-4333-3333-333333333333');
                expect(user.teams.get(teamId)?.teamName).toBeEqual('Built Team');
            });

            it('should round-trip through flatten and build with empty teams', () => {
                const userId = User.Id.builder.build('user-round-001');
                const original = new User(userId);
                const rebuilt = User.builder.build(original.flatten);
                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.teams.values.length).toBeEqual(original.teams.values.length);
            });

            it('should round-trip through flatten and build with teams', () => {
                const userId = User.Id.builder.build('user-round-002');
                const teamId = Team.Id.builder.build('55555555-5555-4555-5555-555555555555');
                const personId = Person.Id.builder.build('66666666-6666-4666-6666-666666666666');
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, new User.TeamProperties(teamId, 'Round Trip Team', personId));

                const original = new User(userId, teams);
                const rebuilt = User.builder.build(original.flatten);

                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.teams.values.length).toBeEqual(original.teams.values.length);
                expect(rebuilt.teams.get(teamId)?.teamName).toBeEqual('Round Trip Team');
                expect(rebuilt.teams.get(teamId)?.personId.flatten).toBeEqual(personId.flatten);
            });

            it('should build user with multiple teams', () => {
                const flattened = {
                    id: 'user-multi-001',
                    teams: {
                        '77777777-7777-4777-7777-777777777777': {
                            teamId: '77777777-7777-4777-7777-777777777777',
                            teamName: 'Multi Team 1',
                            personId: '88888888-8888-4888-8888-888888888888'
                        },
                        '99999999-9999-4999-9999-999999999999': {
                            teamId: '99999999-9999-4999-9999-999999999999',
                            teamName: 'Multi Team 2',
                            personId: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'
                        }
                    }
                };
                const user = User.builder.build(flattened);
                expect(user.teams.values.length).toBeEqual(2);
            });
        });
    });
});
