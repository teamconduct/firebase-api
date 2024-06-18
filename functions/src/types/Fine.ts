import { Flatten, Guid, ObjectTypeBuilder, TypeBuilder, UtcDate, ValueTypeBuilder, Tagged, TaggedTypeBuilder } from 'firebase-function';
import { Amount } from './Amount';
import { PayedState } from './PayedState';

export type FineId = Tagged<Guid, 'fine'>;

export namespace FineId {
    export const builder = new TaggedTypeBuilder<string, FineId>('fine', new TypeBuilder(Guid.from));
}

export type Fine = {
    id: FineId
    payedState: PayedState,
    date: UtcDate,
    reason: string,
    amount: Amount
}

export namespace Fine {
    export const builder = new ObjectTypeBuilder<Flatten<Fine>, Fine>({
        id: FineId.builder,
        payedState: new ValueTypeBuilder(),
        date: new TypeBuilder(UtcDate.decode),
        reason: new ValueTypeBuilder(),
        amount: Amount.builder
    });
}
