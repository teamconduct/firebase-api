import { expect } from '@assertive-ts/core';
import { NotificationProperties } from '../../src/types/NotificationProperties';
import { Dictionary } from '@stevenkellner/typescript-common-functionality';

describe('NotificationProperties', () => {

    describe('NotificationProperties.TokenId', () => {

        describe('NotificationProperties.TokenId.create', () => {

            it('should create a token ID from a device token', () => {
                const token = 'device-token-12345';
                const tokenId = NotificationProperties.TokenId.create(token);
                expect(tokenId).not.toBeUndefined();
                expect(tokenId.flatten.length).toBeEqual(16);
            });

            it('should create different token IDs for different tokens', () => {
                const token1 = 'device-token-abc';
                const token2 = 'device-token-xyz';
                const tokenId1 = NotificationProperties.TokenId.create(token1);
                const tokenId2 = NotificationProperties.TokenId.create(token2);
                expect(tokenId1.flatten).not.toBeEqual(tokenId2.flatten);
            });

            it('should create consistent token IDs for the same token', () => {
                const token = 'consistent-token';
                const tokenId1 = NotificationProperties.TokenId.create(token);
                const tokenId2 = NotificationProperties.TokenId.create(token);
                expect(tokenId1.flatten).toBeEqual(tokenId2.flatten);
            });

            it('should create token IDs with hexadecimal characters', () => {
                const token = 'test-token';
                const tokenId = NotificationProperties.TokenId.create(token);
                expect(tokenId.flatten).toMatchRegex( /^[0-9a-f]{16}$/);
            });

            it('should handle empty token string', () => {
                const token = '';
                const tokenId = NotificationProperties.TokenId.create(token);
                expect(tokenId.flatten.length).toBeEqual(16);
            });
        });

        describe('NotificationProperties.TokenId.builder', () => {

            it('should build token ID from string', () => {
                const tokenIdString = '0123456789abcdef';
                const tokenId = NotificationProperties.TokenId.builder.build(tokenIdString);
                expect(tokenId.flatten).toBeEqual(tokenIdString);
            });

            it('should preserve token ID value', () => {
                const tokenIdString = 'fedcba9876543210';
                const tokenId = NotificationProperties.TokenId.builder.build(tokenIdString);
                expect(tokenId.flatten).toBeEqual(tokenIdString);
            });
        });
    });

    describe('NotificationProperties.Subscription', () => {

        describe('NotificationProperties.Subscription type', () => {

            it('should be valid subscription types', () => {
                const sub1: NotificationProperties.Subscription = 'new-fine';
                const sub2: NotificationProperties.Subscription = 'fine-reminder';
                const sub3: NotificationProperties.Subscription = 'fine-state-change';
                expect(sub1).toBeEqual('new-fine');
                expect(sub2).toBeEqual('fine-reminder');
                expect(sub3).toBeEqual('fine-state-change');
            });
        });

        describe('NotificationProperties.Subscription.all', () => {

            it('should contain all subscription types', () => {
                expect(NotificationProperties.Subscription.all.length).toBeEqual(3);
            });

            it('should contain new-fine subscription', () => {
                expect(NotificationProperties.Subscription.all.includes('new-fine')).toBeTrue();
            });

            it('should contain fine-reminder subscription', () => {
                expect(NotificationProperties.Subscription.all.includes('fine-reminder')).toBeTrue();
            });

            it('should contain fine-state-change subscription', () => {
                expect(NotificationProperties.Subscription.all.includes('fine-state-change')).toBeTrue();
            });

            it('should contain only valid subscription strings', () => {
                NotificationProperties.Subscription.all.forEach(subscription => {
                    expect(typeof subscription).toBeEqual('string');
                });
            });
        });

        describe('NotificationProperties.Subscription.builder', () => {

            it('should build valid subscription from string', () => {
                const subscription = NotificationProperties.Subscription.builder.build('new-fine');
                expect(subscription).toBeEqual('new-fine');
            });

            it('should preserve subscription value', () => {
                const subscription = NotificationProperties.Subscription.builder.build('fine-reminder');
                expect(subscription).toBeEqual('fine-reminder');
            });
        });
    });

    describe('NotificationProperties', () => {

        describe('NotificationProperties constructor', () => {

            it('should create notification properties with empty tokens and subscriptions', () => {
                const props = new NotificationProperties();
                expect(props.tokens.values.length).toBeEqual(0);
                expect(props.subscriptions.length).toBeEqual(0);
            });

            it('should create notification properties with tokens', () => {
                const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
                const tokenId = NotificationProperties.TokenId.create('test-token');
                tokens.set(tokenId, 'test-token');

                const props = new NotificationProperties(tokens);
                expect(props.tokens.values.length).toBeEqual(1);
                expect(props.tokens.get(tokenId)).toBeEqual('test-token');
            });

            it('should create notification properties with subscriptions', () => {
                const subscriptions: NotificationProperties.Subscription[] = ['new-fine', 'fine-reminder'];
                const props = new NotificationProperties(new Dictionary(NotificationProperties.TokenId.builder), subscriptions);
                expect(props.subscriptions.length).toBeEqual(2);
                expect(props.subscriptions[0]).toBeEqual('new-fine');
                expect(props.subscriptions[1]).toBeEqual('fine-reminder');
            });

            it('should create notification properties with both tokens and subscriptions', () => {
                const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
                const tokenId = NotificationProperties.TokenId.create('device-token');
                tokens.set(tokenId, 'device-token');
                const subscriptions: NotificationProperties.Subscription[] = ['new-fine'];

                const props = new NotificationProperties(tokens, subscriptions);
                expect(props.tokens.values.length).toBeEqual(1);
                expect(props.subscriptions.length).toBeEqual(1);
            });

            it('should create notification properties with multiple tokens', () => {
                const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
                const tokenId1 = NotificationProperties.TokenId.create('token-1');
                const tokenId2 = NotificationProperties.TokenId.create('token-2');
                tokens.set(tokenId1, 'token-1');
                tokens.set(tokenId2, 'token-2');

                const props = new NotificationProperties(tokens);
                expect(props.tokens.values.length).toBeEqual(2);
            });

            it('should create notification properties with all subscription types', () => {
                const subscriptions: NotificationProperties.Subscription[] = ['new-fine', 'fine-reminder', 'fine-state-change'];
                const props = new NotificationProperties(new Dictionary(NotificationProperties.TokenId.builder), subscriptions);
                expect(props.subscriptions.length).toBeEqual(3);
            });
        });

        describe('NotificationProperties.flatten', () => {

            it('should return flattened representation with empty tokens and subscriptions', () => {
                const props = new NotificationProperties();
                const flattened = props.flatten;
                expect(Object.keys(flattened.tokens)).toBeEqual([]);
                expect(flattened.subscriptions.length).toBeEqual(0);
            });

            it('should return flattened representation with tokens', () => {
                const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
                const tokenId = NotificationProperties.TokenId.create('flatten-token');
                tokens.set(tokenId, 'flatten-token');

                const props = new NotificationProperties(tokens);
                const flattened = props.flatten;
                expect(flattened.tokens[tokenId.flatten]).toBeEqual('flatten-token');
            });

            it('should return flattened representation with subscriptions', () => {
                const subscriptions: NotificationProperties.Subscription[] = ['new-fine', 'fine-state-change'];
                const props = new NotificationProperties(new Dictionary(NotificationProperties.TokenId.builder), subscriptions);
                const flattened = props.flatten;
                expect(flattened.subscriptions.length).toBeEqual(2);
                expect(flattened.subscriptions[0]).toBeEqual('new-fine');
                expect(flattened.subscriptions[1]).toBeEqual('fine-state-change');
            });

            it('should match the original values', () => {
                const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
                const tokenId = NotificationProperties.TokenId.create('match-token');
                tokens.set(tokenId, 'match-token');
                const subscriptions: NotificationProperties.Subscription[] = ['fine-reminder'];

                const props = new NotificationProperties(tokens, subscriptions);
                const flattened = props.flatten;
                expect(flattened.subscriptions).toBeEqual(subscriptions);
            });

            it('should have correct structure', () => {
                const props = new NotificationProperties();
                const flattened = props.flatten;
                expect(typeof flattened.tokens).toBeEqual('object');
                expect(Array.isArray(flattened.subscriptions)).toBeTrue();
            });
        });

        describe('NotificationProperties.TypeBuilder', () => {

            it('should build notification properties from flattened data with empty values', () => {
                const flattened = {
                    tokens: {},
                    subscriptions: [] as NotificationProperties.Subscription[]
                };
                const props = NotificationProperties.builder.build(flattened);
                expect(props.tokens.values.length).toBeEqual(0);
                expect(props.subscriptions.length).toBeEqual(0);
            });

            it('should build notification properties from flattened data with tokens', () => {
                const tokenId = NotificationProperties.TokenId.create('build-token');
                const flattened = {
                    tokens: {
                        [tokenId.flatten]: 'build-token'
                    },
                    subscriptions: [] as NotificationProperties.Subscription[]
                };
                const props = NotificationProperties.builder.build(flattened);
                expect(props.tokens.values.length).toBeEqual(1);
                expect(props.tokens.get(tokenId)).toBeEqual('build-token');
            });

            it('should build notification properties from flattened data with subscriptions', () => {
                const flattened = {
                    tokens: {},
                    subscriptions: ['new-fine', 'fine-reminder'] as NotificationProperties.Subscription[]
                };
                const props = NotificationProperties.builder.build(flattened);
                expect(props.subscriptions.length).toBeEqual(2);
                expect(props.subscriptions[0]).toBeEqual('new-fine');
            });

            it('should build notification properties from flattened data with both', () => {
                const tokenId = NotificationProperties.TokenId.create('both-token');
                const flattened = {
                    tokens: {
                        [tokenId.flatten]: 'both-token'
                    },
                    subscriptions: ['fine-state-change'] as NotificationProperties.Subscription[]
                };
                const props = NotificationProperties.builder.build(flattened);
                expect(props.tokens.values.length).toBeEqual(1);
                expect(props.subscriptions.length).toBeEqual(1);
            });

            it('should round-trip through flatten and build with empty values', () => {
                const original = new NotificationProperties();
                const rebuilt = NotificationProperties.builder.build(original.flatten);
                expect(rebuilt.tokens.values.length).toBeEqual(original.tokens.values.length);
                expect(rebuilt.subscriptions.length).toBeEqual(original.subscriptions.length);
            });

            it('should round-trip through flatten and build with tokens', () => {
                const tokens = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
                const tokenId = NotificationProperties.TokenId.create('round-trip-token');
                tokens.set(tokenId, 'round-trip-token');

                const original = new NotificationProperties(tokens);
                const rebuilt = NotificationProperties.builder.build(original.flatten);
                expect(rebuilt.tokens.values.length).toBeEqual(1);
                expect(rebuilt.tokens.get(tokenId)).toBeEqual('round-trip-token');
            });

            it('should round-trip through flatten and build with subscriptions', () => {
                const subscriptions: NotificationProperties.Subscription[] = ['new-fine', 'fine-reminder', 'fine-state-change'];
                const original = new NotificationProperties(new Dictionary(NotificationProperties.TokenId.builder), subscriptions);
                const rebuilt = NotificationProperties.builder.build(original.flatten);
                expect(rebuilt.subscriptions.length).toBeEqual(3);
                expect(rebuilt.subscriptions).toBeEqual(subscriptions);
            });

            it('should build with multiple tokens', () => {
                const tokenId1 = NotificationProperties.TokenId.create('multi-token-1');
                const tokenId2 = NotificationProperties.TokenId.create('multi-token-2');
                const flattened = {
                    tokens: {
                        [tokenId1.flatten]: 'multi-token-1',
                        [tokenId2.flatten]: 'multi-token-2'
                    },
                    subscriptions: [] as NotificationProperties.Subscription[]
                };
                const props = NotificationProperties.builder.build(flattened);
                expect(props.tokens.values.length).toBeEqual(2);
            });
        });
    });
});
