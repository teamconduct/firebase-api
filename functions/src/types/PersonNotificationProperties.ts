import { ObjectTypeBuilder, Flatten, ValueTypeBuilder, ArrayTypeBuilder, Tagged, TaggedTypeBuilder, Dictionary, DictionaryTypeBuilder, HexBytesCoder, Sha512, Utf8BytesCoder } from 'firebase-function';

export type TokenId = Tagged<string, 'notificationToken'>;

export namespace TokenId {

    export const builder = new TaggedTypeBuilder<string, TokenId>('notificationToken', new ValueTypeBuilder());

    export function create(token: string): TokenId {
        const tokenCoder = new Utf8BytesCoder();
        const hasher = new Sha512();
        const idCoder = new HexBytesCoder();
        const tokenBytes = tokenCoder.encode(token);
        const tokenIdBytes = hasher.hash(tokenBytes);
        const tokenId = idCoder.decode(tokenIdBytes);
        const rawId = tokenId.slice(0, 16);
        return new Tagged(rawId, 'notificationToken');
    }
}

export type NotificationSubscription =
    | 'new-fine'
    | 'fine-reminder'
    | 'fine-state-change';

export type PersonNotificationProperties = {
    tokens: Dictionary<TokenId, string>,
    subscriptions: NotificationSubscription[]
};

export namespace PersonNotificationProperties {

    export const builder = new ObjectTypeBuilder<Flatten<PersonNotificationProperties>, PersonNotificationProperties>({
        tokens: new DictionaryTypeBuilder(new ValueTypeBuilder()),
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });
}
