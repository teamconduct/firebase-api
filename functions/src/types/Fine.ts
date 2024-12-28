import { Flatten, Guid, ObjectTypeBuilder, TypeBuilder, UtcDate, ValueTypeBuilder, Tagged, TaggedTypeBuilder } from 'firebase-function';
import { PayedState } from './PayedState';
import { FineValue } from './FineValue';

export type FineId = Tagged<Guid, 'fine'>;

export namespace FineId {
    export const builder = new TaggedTypeBuilder<string, FineId>('fine', new TypeBuilder(Guid.from));
}

export type Fine = {
    id: FineId
    payedState: PayedState,
    date: UtcDate,
    reason: string,
    value: FineValue
}

export namespace Fine {
    export const builder = new ObjectTypeBuilder<Flatten<Fine>, Fine>({
        id: FineId.builder,
        payedState: new ValueTypeBuilder(),
        date: new TypeBuilder(UtcDate.decode),
        reason: new ValueTypeBuilder(),
        value: FineValue.builder
    });
}
