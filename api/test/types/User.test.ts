import { expect } from '@assertive-ts/core';
import { User } from '../../src/types/User';
import { Team } from '../../src/types/Team';
import { Person } from '../../src/types/Person';
import { Dictionary, Guid, UtcDate } from '@stevenkellner/typescript-common-functionality';

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

    describe('User.SignInTypeEmail', () => {

        describe('User.SignInTypeEmail constructor', () => {

            it('should create email sign-in type with email', () => {
                const signInType = new User.SignInTypeEmail('test@example.com');
                expect(signInType.email).toBeEqual('test@example.com');
            });

            it('should create email sign-in type with different emails', () => {
                const signInType1 = new User.SignInTypeEmail('user1@test.com');
                const signInType2 = new User.SignInTypeEmail('user2@test.com');
                expect(signInType1.email).toBeEqual('user1@test.com');
                expect(signInType2.email).toBeEqual('user2@test.com');
            });
        });

        describe('User.SignInTypeEmail.flatten', () => {

            it('should return flattened representation with email type', () => {
                const signInType = new User.SignInTypeEmail('flatten@test.com');
                const flattened = signInType.flatten;
                expect(flattened.type).toBeEqual('email');
                expect(flattened.email).toBeEqual('flatten@test.com');
            });

            it('should preserve email value', () => {
                const email = 'preserve@example.com';
                const signInType = new User.SignInTypeEmail(email);
                expect(signInType.flatten.email).toBeEqual(email);
            });

            it('should have correct structure', () => {
                const signInType = new User.SignInTypeEmail('struct@test.com');
                const flattened = signInType.flatten;
                expect(typeof flattened.type).toBeEqual('string');
                expect(typeof flattened.email).toBeEqual('string');
            });
        });

        describe('User.SignInTypeEmail.TypeBuilder', () => {

            it('should build from flattened data', () => {
                const flattened = {
                    type: 'email' as const,
                    email: 'build@test.com'
                };
                const signInType = User.SignInTypeEmail.builder.build(flattened);
                expect(signInType.email).toBeEqual('build@test.com');
            });

            it('should round-trip through flatten and build', () => {
                const original = new User.SignInTypeEmail('roundtrip@test.com');
                const rebuilt = User.SignInTypeEmail.builder.build(original.flatten);
                expect(rebuilt.email).toBeEqual(original.email);
            });

            it('should handle various email formats', () => {
                const emails = ['simple@test.com', 'with.dot@test.com', 'with+plus@test.com'];
                emails.forEach(email => {
                    const flattened = { type: 'email' as const, email };
                    const signInType = User.SignInTypeEmail.builder.build(flattened);
                    expect(signInType.email).toBeEqual(email);
                });
            });
        });
    });

    describe('User.SignInTypeOAuth', () => {

        describe('User.SignInTypeOAuth constructor', () => {

            it('should create OAuth sign-in type with google provider', () => {
                const signInType = new User.SignInTypeOAuth('google');
                expect(signInType.provider).toBeEqual('google');
            });

            it('should create OAuth sign-in type with apple provider', () => {
                const signInType = new User.SignInTypeOAuth('apple');
                expect(signInType.provider).toBeEqual('apple');
            });
        });

        describe('User.SignInTypeOAuth.flatten', () => {

            it('should return flattened representation with google type', () => {
                const signInType = new User.SignInTypeOAuth('google');
                const flattened = signInType.flatten;
                expect(flattened.type).toBeEqual('google');
            });

            it('should return flattened representation with apple type', () => {
                const signInType = new User.SignInTypeOAuth('apple');
                const flattened = signInType.flatten;
                expect(flattened.type).toBeEqual('apple');
            });

            it('should preserve provider value', () => {
                const signInType1 = new User.SignInTypeOAuth('google');
                const signInType2 = new User.SignInTypeOAuth('apple');
                expect(signInType1.flatten.type).toBeEqual('google');
                expect(signInType2.flatten.type).toBeEqual('apple');
            });

            it('should have correct structure', () => {
                const signInType = new User.SignInTypeOAuth('google');
                const flattened = signInType.flatten;
                expect(typeof flattened.type).toBeEqual('string');
            });
        });

        describe('User.SignInTypeOAuth.TypeBuilder', () => {

            it('should build from flattened data with google', () => {
                const flattened = { type: 'google' as const };
                const signInType = User.SignInTypeOAuth.builder.build(flattened);
                expect(signInType.provider).toBeEqual('google');
            });

            it('should build from flattened data with apple', () => {
                const flattened = { type: 'apple' as const };
                const signInType = User.SignInTypeOAuth.builder.build(flattened);
                expect(signInType.provider).toBeEqual('apple');
            });

            it('should round-trip through flatten and build for google', () => {
                const original = new User.SignInTypeOAuth('google');
                const rebuilt = User.SignInTypeOAuth.builder.build(original.flatten);
                expect(rebuilt.provider).toBeEqual(original.provider);
            });

            it('should round-trip through flatten and build for apple', () => {
                const original = new User.SignInTypeOAuth('apple');
                const rebuilt = User.SignInTypeOAuth.builder.build(original.flatten);
                expect(rebuilt.provider).toBeEqual(original.provider);
            });
        });
    });

    describe('User.SignInType', () => {

        describe('User.SignInType.TypeBuilder', () => {

            it('should build email sign-in type from flattened data', () => {
                const flattened = {
                    type: 'email' as const,
                    email: 'union@test.com'
                };
                const signInType = User.SignInType.builder.build(flattened);
                expect(signInType instanceof User.SignInTypeEmail).toBeTrue();
                if (signInType instanceof User.SignInTypeEmail)
                    expect(signInType.email).toBeEqual('union@test.com');

            });

            it('should build google OAuth sign-in type from flattened data', () => {
                const flattened = { type: 'google' as const };
                const signInType = User.SignInType.builder.build(flattened);
                expect(signInType instanceof User.SignInTypeOAuth).toBeTrue();
                if (signInType instanceof User.SignInTypeOAuth)
                    expect(signInType.provider).toBeEqual('google');

            });

            it('should build apple OAuth sign-in type from flattened data', () => {
                const flattened = { type: 'apple' as const };
                const signInType = User.SignInType.builder.build(flattened);
                expect(signInType instanceof User.SignInTypeOAuth).toBeTrue();
                if (signInType instanceof User.SignInTypeOAuth)
                    expect(signInType.provider).toBeEqual('apple');

            });

            it('should round-trip email sign-in type', () => {
                const original = new User.SignInTypeEmail('roundtrip@test.com');
                const rebuilt = User.SignInType.builder.build(original.flatten);
                expect(rebuilt instanceof User.SignInTypeEmail).toBeTrue();
                if (rebuilt instanceof User.SignInTypeEmail)
                    expect(rebuilt.email).toBeEqual(original.email);

            });

            it('should round-trip OAuth sign-in type', () => {
                const original = new User.SignInTypeOAuth('google');
                const rebuilt = User.SignInType.builder.build(original.flatten);
                expect(rebuilt instanceof User.SignInTypeOAuth).toBeTrue();
                if (rebuilt instanceof User.SignInTypeOAuth)
                    expect(rebuilt.provider).toBeEqual(original.provider);

            });

            it('should handle all sign-in types', () => {
                const signInTypes: User.SignInType[] = [
                    new User.SignInTypeEmail('all@test.com'),
                    new User.SignInTypeOAuth('google'),
                    new User.SignInTypeOAuth('apple')
                ];

                signInTypes.forEach(signInType => {
                    const rebuilt = User.SignInType.builder.build(signInType.flatten);
                    expect(rebuilt.flatten).toBeEqual(signInType.flatten);
                });
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
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeEmail('user001@test.com');
                const user = new User(userId, signInDate, signInType);
                expect(user.id).toBeEqual(userId);
                expect(user.signInDate).toBeEqual(signInDate);
                expect(user.signInType).toBeEqual(signInType);
                expect(user.teams.values.length).toBeEqual(0);
            });

            it('should create a user with ID and teams', () => {
                const userId = User.Id.builder.build('user-002');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeOAuth('google');
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teamProperties = new User.TeamProperties(teamId, 'Team A', personId);
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, teamProperties);

                const user = new User(userId, signInDate, signInType, teams);
                expect(user.id).toBeEqual(userId);
                expect(user.signInDate).toBeEqual(signInDate);
                expect(user.signInType).toBeEqual(signInType);
                expect(user.teams.values.length).toBeEqual(1);
                expect(user.teams.get(teamId)?.teamName).toBeEqual('Team A');
            });

            it('should create a user with multiple teams', () => {
                const userId = User.Id.builder.build('user-003');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeOAuth('apple');
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);

                const teamId1 = Team.Id.builder.build(Guid.generate().guidString);
                const personId1 = Person.Id.builder.build(Guid.generate().guidString);
                teams.set(teamId1, new User.TeamProperties(teamId1, 'Team One', personId1));

                const teamId2 = Team.Id.builder.build(Guid.generate().guidString);
                const personId2 = Person.Id.builder.build(Guid.generate().guidString);
                teams.set(teamId2, new User.TeamProperties(teamId2, 'Team Two', personId2));
                const user = new User(userId, signInDate, signInType, teams);
                expect(user.teams.values.length).toBeEqual(2);
            });
        });

        describe('User.flatten', () => {

            it('should return flattened representation with empty teams', () => {
                const userId = User.Id.builder.build('user-flat-001');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeEmail('flat001@test.com');
                const user = new User(userId, signInDate, signInType);
                const flattened = user.flatten;
                expect(flattened.id).toBeEqual('user-flat-001');
                expect(flattened.signInDate).toBeEqual(signInDate.flatten);
                expect(flattened.signInType.type).toBeEqual('email');
                expect(Object.keys(flattened.teams)).toBeEqual([]);
            });

            it('should return flattened representation with teams', () => {
                const userId = User.Id.builder.build('user-flat-002');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeOAuth('google');
                const teamId = Team.Id.builder.build('11111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('22222222-2222-4222-2222-222222222222');
                const teamProperties = new User.TeamProperties(teamId, 'Team Flatten', personId);
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, teamProperties);

                const user = new User(userId, signInDate, signInType, teams);
                const flattened = user.flatten;
                expect(flattened.id).toBeEqual('user-flat-002');
                expect(flattened.signInDate).toBeEqual(signInDate.flatten);
                expect(flattened.signInType.type).toBeEqual('google');
                expect(flattened.teams['11111111-1111-4111-1111-111111111111']).not.toBeUndefined();
                expect(flattened.teams['11111111-1111-4111-1111-111111111111'].teamName).toBeEqual('Team Flatten');
            });

            it('should match the original values', () => {
                const userId = User.Id.builder.build('user-match-001');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeEmail('match@test.com');
                const teamId = Team.Id.builder.build(Guid.generate().guidString);
                const personId = Person.Id.builder.build(Guid.generate().guidString);
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, new User.TeamProperties(teamId, 'Match Team', personId));

                const user = new User(userId, signInDate, signInType, teams);
                const flattened = user.flatten;
                expect(flattened.id).toBeEqual(userId.flatten);
                expect(flattened.signInDate).toBeEqual(signInDate.flatten);
                expect(flattened.signInType).toBeEqual(signInType.flatten);
            });

            it('should have correct structure', () => {
                const userId = User.Id.builder.build('user-struct-001');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeOAuth('apple');
                const user = new User(userId, signInDate, signInType);
                const flattened = user.flatten;
                expect(typeof flattened.id).toBeEqual('string');
                expect(typeof flattened.signInDate).toBeEqual('string');
                expect(typeof flattened.signInType).toBeEqual('object');
                expect(typeof flattened.teams).toBeEqual('object');
            });
        });

        describe('User.TypeBuilder', () => {

            it('should build user from flattened data with empty teams', () => {
                const flattened = {
                    id: 'user-build-001',
                    signInDate: '2024-01-15-10-30',
                    signInType: {
                        type: 'email' as const,
                        email: 'build001@test.com'
                    },
                    teams: {}
                };
                const user = User.builder.build(flattened);
                expect(user.id.flatten).toBeEqual('user-build-001');
                expect(user.signInDate.flatten).toBeEqual('2024-01-15-10-30');
                expect(user.signInType instanceof User.SignInTypeEmail).toBeTrue();
                expect(user.teams.values.length).toBeEqual(0);
            });

            it('should build user from flattened data with teams', () => {
                const flattened = {
                    id: 'user-build-002',
                    signInDate: '2024-02-20-14-45',
                    signInType: {
                        type: 'google' as const
                    },
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
                expect(user.signInDate.flatten).toBeEqual('2024-02-20-14-45');
                expect(user.signInType instanceof User.SignInTypeOAuth).toBeTrue();
                expect(user.teams.values.length).toBeEqual(1);
                const teamId = Team.Id.builder.build('33333333-3333-4333-3333-333333333333');
                expect(user.teams.get(teamId)?.teamName).toBeEqual('Built Team');
            });

            it('should round-trip through flatten and build with empty teams', () => {
                const userId = User.Id.builder.build('user-round-001');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeEmail('round001@test.com');
                const original = new User(userId, signInDate, signInType);
                const rebuilt = User.builder.build(original.flatten);
                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.signInDate.flatten).toBeEqual(original.signInDate.flatten);
                expect(rebuilt.signInType.flatten).toBeEqual(original.signInType.flatten);
                expect(rebuilt.teams.values.length).toBeEqual(original.teams.values.length);
            });

            it('should round-trip through flatten and build with teams', () => {
                const userId = User.Id.builder.build('user-round-002');
                const signInDate = UtcDate.now;
                const signInType = new User.SignInTypeOAuth('apple');
                const teamId = Team.Id.builder.build('55555555-5555-4555-5555-555555555555');
                const personId = Person.Id.builder.build('66666666-6666-4666-6666-666666666666');
                const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
                teams.set(teamId, new User.TeamProperties(teamId, 'Round Trip Team', personId));

                const original = new User(userId, signInDate, signInType, teams);
                const rebuilt = User.builder.build(original.flatten);

                expect(rebuilt.id.flatten).toBeEqual(original.id.flatten);
                expect(rebuilt.signInDate.flatten).toBeEqual(original.signInDate.flatten);
                expect(rebuilt.signInType.flatten).toBeEqual(original.signInType.flatten);
                expect(rebuilt.teams.values.length).toBeEqual(original.teams.values.length);
                expect(rebuilt.teams.get(teamId)?.teamName).toBeEqual('Round Trip Team');
                expect(rebuilt.teams.get(teamId)?.personId.flatten).toBeEqual(personId.flatten);
            });

            it('should build user with multiple teams', () => {
                const flattened = {
                    id: 'user-multi-001',
                    signInDate: '2024-03-25T16:00:00.000Z',
                    signInType: {
                        type: 'email' as const,
                        email: 'multi@test.com'
                    },
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
