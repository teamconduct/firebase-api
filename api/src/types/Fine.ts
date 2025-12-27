import { Flattable, Guid, ITypeBuilder, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { FineAmount } from './FineAmount';
import { PayedState } from './PayedState';

/**
 * Represents a fine assigned to a person in a team.
 *
 * Contains information about the fine's payment status, date, reason, and monetary amount.
 */
export class Fine implements Flattable<Fine.Flatten> {

    /**
     * Creates a new Fine instance.
     *
     * @param id - Unique identifier for the fine (GUID)
     * @param payedState - Payment status ('payed' or 'notPayed')
     * @param date - Date when the fine was issued
     * @param reason - Description or reason for the fine
     * @param amount - Monetary amount of the fine
     */
    public constructor(
        public id: Fine.Id,
        public payedState: PayedState,
        public date: UtcDate,
        public reason: string,
        public amount: FineAmount
    ) {}

    /**
     * Returns the flattened representation for serialization.
     */
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

    /**
     * Tagged GUID type for fine identifiers.
     */
    export type Id = Tagged<Guid, 'fine'>;

    export namespace Id {

        /**
         * Flattened representation of a fine ID (GUID string).
         */
        export type Flatten = string;

        /**
         * Type builder for Fine.Id serialization/deserialization.
         */
        export const builder = Tagged.builder('fine' as const, Guid.builder);
    }

    /**
     * Flattened representation of a Fine for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        payedState: PayedState,
        date: UtcDate.Flatten,
        reason: string,
        amount: FineAmount.Flatten
    };

    /**
     * Type builder for Fine serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, Fine> {

        /**
         * Builds a Fine instance from flattened data.
         *
         * @param value - Flattened fine data
         * @returns Fine instance
         */
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

    /**
     * Singleton instance of TypeBuilder for Fine.
     */
    export const builder = new TypeBuilder();
}
