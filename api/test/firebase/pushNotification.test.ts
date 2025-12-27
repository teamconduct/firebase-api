import { describe, it } from 'mocha';
import { expect } from '@assertive-ts/core';
import { pushNotification } from '../../src/firebase/pushNotification';
import { Team, Person, NotificationProperties } from '../../src/types/index';
import { Dictionary, Guid } from '@stevenkellner/typescript-common-functionality';
import { configureFirebase, Collection, Document } from './firebase-utils';
import { Firestore } from '../../src';

describe('pushNotification', () => {
    const teamId = Team.Id.builder.build(Guid.generate().guidString);
    const personId = Person.Id.builder.build(Guid.generate().guidString);

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

            await pushNotification(teamId, personId, 'new-fine', {
                title: 'Test Notification',
                body: 'Test Body'
            });
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

            await pushNotification(teamId, personId, 'new-fine', {
                title: 'Test Notification',
                body: 'Test Body'
            });
        });
    });

    describe('person is not subscribed to topic', () => {
        it('should return without sending when person is not subscribed', async () => {
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, ['fine-reminder'])
                        })
                    })
                })
            });

            await pushNotification(teamId, personId, 'new-fine', {
                title: 'Test Notification',
                body: 'Test Body'
            });
        });
    });

    describe('successful notification', () => {
        it('should send notification to subscribed person with tokens', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token-1'), 'device-token-1');
            tokens.set(NotificationProperties.TokenId.create('device-token-2'), 'device-token-2');

            let messagingCalled = false;
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, ['new-fine', 'fine-reminder'], tokens)
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

            await pushNotification(teamId, personId, 'new-fine', {
                title: 'New Fine',
                body: 'You have received a new fine'
            });

            expect(messagingCalled).toBeTrue();
        });

        it('should send notification for different subscription topics', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token-1'), 'device-token-1');

            let messagingCalled = false;
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, ['fine-state-change'], tokens)
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

            await pushNotification(teamId, personId, 'fine-state-change', {
                title: 'Fine State Changed',
                body: 'A fine state has been updated'
            });

            expect(messagingCalled).toBeTrue();
        });
    });

    describe('token filtering', () => {
        it('should handle person with empty token list', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);

            let messagingCalled = false;
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, ['new-fine'], tokens)
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

            await pushNotification(teamId, personId, 'new-fine', {
                title: 'Test Notification',
                body: 'Test Body'
            });

            expect(messagingCalled).toBeTrue();
        });

        it('should handle person with multiple tokens, removing invalid ones', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            for (let i = 1; i <= 5; i++)
                tokens.set(NotificationProperties.TokenId.create(`device-token-${i}`), `device-token-${i}`);

            let messagingCalled = false;
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, ['new-fine'], tokens)
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

            await pushNotification(teamId, personId, 'new-fine', {
                title: 'Test Notification',
                body: 'Test Body'
            });

            expect(messagingCalled).toBeTrue();

            const personSnapshot = await Firestore.shared.person(teamId, personId).snapshot();
            expect(personSnapshot.exists).toBeTrue();
            const person = Person.builder.build(personSnapshot.data);
            expect(person.signInProperties).not.toBeNull();
            const newTokens = person.signInProperties!.notificationProperties.tokens.values;
            expect(newTokens.length).toBeEqual(3);
            expect(newTokens).toContainAll('device-token-1', 'device-token-3', 'device-token-5');
        });
    });

    describe('subscription matching', () => {
        it('should send when person is subscribed to multiple topics including the target', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token'), 'device-token');

            let messagingCalled = false;
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, ['new-fine', 'fine-reminder', 'fine-state-change'], tokens)
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

            await pushNotification(teamId, personId, 'fine-reminder', {
                title: 'Fine Reminder',
                body: 'This is a reminder about your fine'
            });

            expect(messagingCalled).toBeTrue();
        });

        it('should not send when topic is not in subscription list', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token'), 'device-token');

            let messagingCalled = false;
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, ['fine-reminder'], tokens)
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

            await pushNotification(teamId, personId, 'fine-state-change', {
                title: 'Fine State Changed',
                body: 'A fine state has been updated'
            });

            expect(messagingCalled).toBeFalse();
        });

        it('should handle person with no subscriptions', async () => {
            const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
            tokens.set(NotificationProperties.TokenId.create('device-token'), 'device-token');

            let messagingCalled = false;
            configureFirebase({
                teams: Collection.docs({
                    [teamId.guidString]: Document.colls({
                        persons: Collection.docs({
                            [personId.guidString]: Document.personWithSubscriptions(personId, [], tokens)
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

            await pushNotification(teamId, personId, 'new-fine', {
                title: 'Test Notification',
                body: 'Test Body'
            });

            expect(messagingCalled).toBeFalse();
        });
    });
});
