import { describe, it } from 'mocha';
import { expect } from '@assertive-ts/core';
import { checkAuthentication } from '../../src/firebase/checkAuthentication';
import { User, Team, Person } from '../../src/types/index';
import { Dictionary } from '@stevenkellner/typescript-common-functionality';
import { configureFirebase, expectThrowsFunctionsError, Collection, Document } from './firebase-utils';

describe('checkAuthentication', () => {
    const teamId = Team.Id.builder.build('11111111-1111-4111-1111-111111111111');
    const personId = Person.Id.builder.build('22222222-2222-4222-2222-222222222222');
    const userId = User.Id.builder.build('user123');

    describe('checkAuthentication - basic validation', () => {
        it('should throw "unauthenticated" error if rawUserId is null', async () => {
            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(null, teamId, 'team-manager');
            }, 'unauthenticated', 'User is not authenticated');
        });

        it('should throw "permission-denied" if user does not exist', async () => {
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.empty()
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, 'team-manager');
            }, 'permission-denied', 'User does not exist');
        });

        it('should throw "permission-denied" if user is not a member of the team', async () => {
            const emptyTeams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, emptyTeams)
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, 'team-manager');
            }, 'permission-denied', 'User is not a member of the team');
        });

        it('should throw "permission-denied" if person does not exist', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.empty()
                        })
                    })
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, 'team-manager');
            }, 'permission-denied', 'Person does not exist');
        });

        it('should throw "permission-denied" if person is not signed in', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personNotSignedIn(personId)
                        })
                    })
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, 'team-manager');
            }, 'permission-denied', 'Person is not signed in');
        });
    });

    describe('checkAuthentication - role validation', () => {
        it('should throw "permission-denied" if user does not have required single role', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['person-manager'])
                        })
                    })
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, 'team-manager');
            }, 'permission-denied', 'User does not have the required roles');
        });

        it('should return userId if user has required single role', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['team-manager', 'person-manager'])
                        })
                    })
                })
            });

            const result = await checkAuthentication(userId.value, teamId, 'team-manager');
            expect(result).toBeEqual(userId);
        });

        it('should throw "permission-denied" if user does not have all required roles (AND logic)', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['person-manager'])
                        })
                    })
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, ['person-manager', 'team-manager']);
            }, 'permission-denied', 'User does not have the required roles');
        });

        it('should return userId if user has all required roles (AND logic)', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['person-manager', 'team-manager', 'fine-manager'])
                        })
                    })
                })
            });

            const result = await checkAuthentication(userId.value, teamId, ['person-manager', 'team-manager']);
            expect(result).toBeEqual(userId);
        });

        it('should return userId if user has at least one required role (OR logic)', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['person-manager'])
                        })
                    })
                })
            });

            const result = await checkAuthentication(userId.value, teamId, { anyOf: ['person-manager', 'team-manager'] });
            expect(result).toBeEqual(userId);
        });

        it('should throw "permission-denied" if user does not have any required role (OR logic)', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['fine-manager'])
                        })
                    })
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, { anyOf: ['person-manager', 'team-manager'] });
            }, 'permission-denied', 'User does not have the required roles');

        });

        it('should handle complex nested role requirements (AND with OR)', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['person-manager', 'fine-manager'])
                        })
                    })
                })
            });

            const result = await checkAuthentication(userId.value, teamId, [
                'person-manager',
                { anyOf: ['fine-manager', 'team-manager'] }
            ]);
            expect(result).toBeEqual(userId);
        });

        it('should throw for complex nested requirements when not satisfied', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, ['person-manager'])
                        })
                    })
                })
            });

            await expectThrowsFunctionsError(async () => {
                await checkAuthentication(userId.value, teamId, [
                    'person-manager',
                    { anyOf: ['fine-manager', 'team-manager'] }
                ]);
            }, 'permission-denied', 'User does not have the required roles');
        });
    });

    describe('checkAuthentication - comprehensive success scenarios', () => {
        it('should return userId for fully authenticated user with all permissions', async () => {
            const teams = new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder);
            teams.set(teamId, User.TeamProperties.builder.build({
                teamId: teamId.guidString,
                teamName: 'Test Team',
                personId: personId.guidString
            }));
            configureFirebase({
                users: Collection.docs({
                    [userId.value]: Document.user(userId, teams)
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, userId, [
                                'person-manager',
                                'team-manager',
                                'fine-manager',
                                'fine-can-add',
                                'fineTemplate-manager'
                            ])
                        })
                    })
                })
            });

            const result = await checkAuthentication(userId.value, teamId, 'fine-can-add');
            expect(result).toBeEqual(userId);
        });
    });
});
