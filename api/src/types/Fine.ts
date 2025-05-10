import { Flattable, Guid, ITypeBuilder, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { FineAmount } from './FineAmount';
import { PayedState } from './PayedState';

export class Fine implements Flattable<Fine.Flatten> {

    public constructor(
        public id: Fine.Id,
        public payedState: PayedState,
        public date: UtcDate,
        public reason: string,
        public amount: FineAmount
    ) {}

    public get flatten(): Fine.Flatten {
        return {
            id: this.id.flatten,
            payedState: this.payedState,
            date: this.date.flatten,
            reason: this.reason,
            amount: this.amount.flatten
        };
    }
}

export namespace Fine {

    export type Id = Tagged<Guid, 'fine'>;

    export namespace Id {

        export type Flatten = string;

        export const builder = Tagged.builder('fine' as const, Guid.builder);
    }

    export type Flatten = {
        id: Id.Flatten,
        payedState: PayedState,
        date: UtcDate.Flatten,
        reason: string,
        amount: FineAmount.Flatten
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, Fine> {

        public build(value: Flatten): Fine {
            return new Fine(
                Id.builder.build(value.id),
                value.payedState,
                UtcDate.builder.build(value.date),
                value.reason,
                FineAmount.builder.build(value.amount)
            );
        }
    }

    export const builder = new TypeBuilder();
}
