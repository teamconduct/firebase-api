import { BytesCoder, Dictionary, Flattable, ITypeBuilder, Sha512, Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class NotificationProperties implements Flattable<NotificationProperties.Flatten> {

    public constructor(
        public tokens: Dictionary<NotificationProperties.TokenId, string> = new Dictionary(NotificationProperties.TokenId.builder),
        public subscriptions: NotificationProperties.Subscription[] = []
    ) {}

    public get flatten(): NotificationProperties.Flatten {
        return {
            tokens: this.tokens.flatten,
            subscriptions: this.subscriptions
        };
    }
}

export namespace NotificationProperties {

    export type TokenId = Tagged<string, 'notificationToken'>;

    export namespace TokenId {

        export function create(token: string): TokenId {
            const hasher = new Sha512();
            const tokenBytes = BytesCoder.fromUtf8(token);
            const tokenIdBytes = hasher.hash(tokenBytes);
            const tokenId = BytesCoder.toHex(tokenIdBytes);
            const rawId = tokenId.slice(0, 16);
            return new Tagged(rawId, 'notificationToken');
        }

        export type Flatten = string;

        export const builder = Tagged.builder('notificationToken' as const, new ValueTypeBuilder<string>());
    }

    export type Subscription =
        | 'new-fine'
        | 'fine-reminder'
        | 'fine-state-change';

    export namespace Subscription {

        export const all: Subscription[] = [
            'new-fine',
            'fine-reminder',
            'fine-state-change'
        ]
    }

    export type Flatten = {
        tokens: Dictionary.Flatten<string>,
        subscriptions: Subscription[]
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, NotificationProperties> {

        public build(value: Flatten): NotificationProperties {
            return new NotificationProperties(Dictionary.builder(TokenId.builder, new ValueTypeBuilder<string>()).build(value.tokens), value.subscriptions);
        }
    }

    export const builder = new TypeBuilder();
}
