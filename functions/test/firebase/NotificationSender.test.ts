import { describe, it, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { Dictionary, Guid } from '@stevenkellner/typescript-common-functionality';
import { configureFirebase, restoreFirebase, Collection, Document } from './firebase-utils';
import { Fine, FineAmount, MoneyAmount, NotificationProperties, Person, Team, User } from '@stevenkellner/team-conduct-api';
import { Firestore, NotificationSender } from '../../src/firebase';

describe('NotificationSender', () => {
    const teamId = Team.Id.builder.build(Guid.generate().guidString);
    const personId = Person.Id.builder.build(Guid.generate().guidString);
    const fineId = Fine.Id.builder.build(Guid.generate().guidString);
    const amount = new FineAmount.Money(new MoneyAmount(10, 0));
    const teamSettings = new Team.TeamSettings(null, false, 'all-fines', 'invite-only', 'EUR', 'de');

    afterEach(() => restoreFirebase());

    describe('person does not exist', () => {
        it('should return without error when person does not exist', async () => {
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.empty()
                        })
                    })
                })
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);
        });
    });

    describe('person is not signed in', () => {
        it('should return without sending when signInProperties is null', async () => {
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personNotSignedIn(personId)
                        })
                    })
                })
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);
        });
    });

    describe('person is not subscribed to topic', () => {
        it('should return without sending when person is not subscribed', async () => {
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties()),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);
        });
    });

    describe('successful notification', () => {
        it('should send notification to subscribed person with tokens', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token-1'), 'device-token-1');
            tokens.set(NotificationProperties.TokenId.create('device-token-2'), 'device-token-2');

            let messagingCalled = false;
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties(tokens, ['new-fine', 'fine-reminder'])),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            },
            {
                sendEachForMulticast: async message => {
                    messagingCalled = true;
                    return {
                        responses: message.tokens.map(token => ({
                            success: true,
                            messageId: `msg-${token}`
                        })),
                        successCount: message.tokens.length,
                        failureCount: 0
                    };
                }
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);

            expect(messagingCalled).toBeTrue();
        });

        it('should send notification for different subscription topics', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token-1'), 'device-token-1');

            let messagingCalled = false;
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties(tokens, ['fine-state-change'])),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            },
            {
                sendEachForMulticast: async message => {
                    messagingCalled = true;
                    return {
                        responses: message.tokens.map(token => ({
                            success: true,
                            messageId: `msg-${token}`
                        })),
                        successCount: message.tokens.length,
                        failureCount: 0
                    }
                }
            });

            await NotificationSender.for(teamId, personId).finePayed(fineId, 'Test Reason', amount, teamSettings);

            expect(messagingCalled).toBeTrue();
        });
    });

    describe('token filtering', () => {
        it('should handle person with empty token list', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);

            let messagingCalled = false;
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties(tokens, ['new-fine'])),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            },
            {
                sendEachForMulticast: async message => {
                    messagingCalled = true;
                    return{
                        responses: message.tokens.map(token => ({
                            success: true,
                            messageId: `msg-${token}`
                        })),
                        successCount: message.tokens.length,
                        failureCount: 0
                    }
                }
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);

            expect(messagingCalled).toBeFalse();
        });

        it('should handle person with multiple tokens, removing invalid ones', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            for (let i = 1; i <= 5; i++)
                tokens.set(NotificationProperties.TokenId.create(`device-token-${i}`), `device-token-${i}`);

            let messagingCalled = false;
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties(tokens, ['new-fine'])),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            },
            {
                sendEachForMulticast: async message => {
                    messagingCalled = true;
                    return {
                        responses: message.tokens.map((token, index) => ({
                            success: index % 2 === 0,
                            messageId: index % 2 === 0 ? `msg-${token}` : undefined,
                            error: index % 2 === 0 ? undefined : {
                                code: index % 4 === 1 ? 'messaging/invalid-registration-token' : 'messaging/invalid-registration-token',
                                message: 'The provided token is invalid.',
                                toJSON: () => ({})
                            }
                        })),
                        successCount: Math.ceil(message.tokens.length / 2),
                        failureCount: Math.floor(message.tokens.length / 2)
                    }
                }
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);

            expect(messagingCalled).toBeTrue();

            const userSnapshot = await Firestore.shared.user(User.Id.builder.build('user-123')).snapshot();
            expect(userSnapshot.exists).toBeTrue();
            const user = User.builder.build(userSnapshot.data);
            expect(user.settings.notification.tokens.values.length).toBeEqual(3);
            expect(user.settings.notification.tokens.values).toContainAll('device-token-1', 'device-token-3', 'device-token-5');
        });
    });

    describe('subscription matching', () => {
        it('should send when person is subscribed to multiple topics including the target', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token'), 'device-token');

            let messagingCalled = false;
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties(tokens, ['new-fine', 'fine-state-change', 'fine-reminder'])),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            },
            {
                sendEachForMulticast: async message => {
                    messagingCalled = true;
                    return {
                        responses: message.tokens.map(token => ({
                            success: true,
                            messageId: `msg-${token}`
                        })),
                        successCount: message.tokens.length,
                        failureCount: 0
                    }
                }
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);

            expect(messagingCalled).toBeTrue();
        });

        it('should not send when topic is not in subscription list', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token'), 'device-token');

            let messagingCalled = false;
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties(tokens, ['fine-reminder'])),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            }, {
                sendEachForMulticast: async message => {
                    messagingCalled = true;
                    return {
                        responses: message.tokens.map(token => ({
                            success: true,
                            messageId: `msg-${token}`
                        })),
                        successCount: message.tokens.length,
                        failureCount: 0
                    }
                }
            });

            await NotificationSender.for(teamId, personId).finePayed(fineId, 'Test Reason', amount, teamSettings);

            expect(messagingCalled).toBeFalse();
        });

        it('should handle person with no subscriptions', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token'), 'device-token');

            let messagingCalled = false;
            configureFirebase({
                users: Collection.docs({
                    [User.Id.builder.build('user-123').value]: Document.user(
                        User.Id.builder.build('user-123'),
                        new User.UserProperties('Test', 'User', null, null),
                        new User.UserSettings(new NotificationProperties(tokens, [])),
                        new Dictionary<Team.Id, User.TeamProperties>(Team.Id.builder)
                    )
                }),
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.person(personId, User.Id.builder.build('user-123'), [])
                        })
                    })
                })
            }, {
                sendEachForMulticast: async message => {
                    messagingCalled = true;
                    return {
                        responses: message.tokens.map(token => ({
                            success: true,
                            messageId: `msg-${token}`
                        })),
                        successCount: message.tokens.length,
                        failureCount: 0
                    };
                }
            });

            await NotificationSender.for(teamId, personId).newFine(fineId, 'Test Reason', amount, teamSettings);

            expect(messagingCalled).toBeFalse();
        });
    });
});
