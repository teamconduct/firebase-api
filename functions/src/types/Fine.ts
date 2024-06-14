import { Flatten, Guid, ObjectTypeBuilder, TypeBuilder, UtcDate, ValueTypeBuilder } from 'firebase-function';
import { Amount } from './Amount';
import { PayedState } from './PayedState';

export type Fine = {
    id: Guid,
    payedState: PayedState,
    date: UtcDate,
    reason: string,
    amount: Amount
}

export namespace Fine {
    export const builder = new ObjectTypeBuilder<Flatten<Fine>, Fine>({
        id: new TypeBuilder(Guid.from),
        payedState: new ValueTypeBuilder(),
        date: new TypeBuilder(UtcDate.decode),
        reason: new ValueTypeBuilder(),
        amount: Amount.builder
    });
}
