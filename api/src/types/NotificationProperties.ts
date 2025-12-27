import { BytesCoder, Dictionary, Flattable, ITypeBuilder, Sha512, Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

/**
 * Represents notification properties for a user including device tokens and subscription preferences.
 *
 * Manages push notification device tokens (identified by hashed token IDs for security)
 * and user preferences for which types of notifications they want to receive.
 */
export class NotificationProperties implements Flattable<NotificationProperties.Flatten> {

    /**
     * Creates new notification properties.
     * @param tokens - Dictionary mapping token IDs to device tokens for push notifications (defaults to empty)
     * @param subscriptions - Array of notification types the user is subscribed to (defaults to empty)
     */
    public constructor(
        public tokens: Dictionary<NotificationProperties.TokenId, string> = new Dictionary(NotificationProperties.TokenId.builder),
        public subscriptions: NotificationProperties.Subscription[] = []
    ) {}

    /**
     * Gets the flattened representation of these notification properties for serialization.
     */
    public get flatten(): NotificationProperties.Flatten {
        return {
            tokens: this.tokens.flatten,
            subscriptions: this.subscriptions
        };
    }
}

export namespace NotificationProperties {

    /**
     * Tagged type for notification token identifiers.
     * Token IDs are derived from hashing the actual device tokens for security.
     */
    export type TokenId = Tagged<string, 'notificationToken'>;

    export namespace TokenId {

        /**
         * Creates a token ID from a device token by hashing it with SHA-512.
         * Only the first 16 characters of the hash are used as the identifier.
         * @param token - The device push notification token
         * @returns A hashed token ID for secure storage and lookup
         */
        export function create(token: string): TokenId {
            const hasher = new Sha512();
            const tokenBytes = BytesCoder.fromUtf8(token);
            const tokenIdBytes = hasher.hash(tokenBytes);
            const tokenId = BytesCoder.toHex(tokenIdBytes);
            const rawId = tokenId.slice(0, 16);
            return new Tagged(rawId, 'notificationToken');
        }

        /**
         * Flattened representation of a token ID (plain string).
         */
        export type Flatten = string;

        /**
         * Builder for constructing TokenId instances from strings.
         */
        export const builder = Tagged.builder('notificationToken' as const, new ValueTypeBuilder<string>());
    }

    /**
     * Available notification subscription types.
     */
    const subscriptions = [
        'new-fine',
        'fine-reminder',
        'fine-state-change'
    ] as const;

    /**
     * Type representing the available notification subscription options.
     * - new-fine: Notifications when a new fine is created
     * - fine-reminder: Reminder notifications for unpaid fines
     * - fine-state-change: Notifications when a fine's status changes
     */
    export type Subscription = typeof subscriptions[number];

    export namespace Subscription {

        /**
         * Readonly array of all available subscription types.
         */
        export const all: readonly Subscription[] = subscriptions

        /**
         * Builder for constructing Subscription values from strings.
         */
        export const builder = new ValueTypeBuilder<Subscription>();
    }

    /**
     * Flattened representation of notification properties for serialization.
     */
    export type Flatten = {
        tokens: Dictionary.Flatten<string>,
        subscriptions: Subscription[]
    };

    /**
     * Builder for constructing NotificationProperties from flattened data.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, NotificationProperties> {

        /**
         * Builds a NotificationProperties instance from flattened data.
         * @param value - The flattened notification properties data
         * @returns A new NotificationProperties instance
         */
        public build(value: Flatten): NotificationProperties {
            return new NotificationProperties(Dictionary.builder(TokenId.builder, new ValueTypeBuilder<string>()).build(value.tokens), value.subscriptions);
        }
    }

    /**
     * Singleton builder instance for NotificationProperties.
     */
    export const builder = new TypeBuilder();
}
