import { Flattable, Guid, ITypeBuilder, Tagged, UtcDate, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Money as MoneyValue } from '../Money';
import { Localization } from '../localization/Localization';
import { Locale } from '../localization/Locale';
import { Currency } from '../Currency';
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
        public amount: Fine.Amount
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
     * Represents the amount of a fine.
     *
     * Can be either Fine.Amount.Money (e.g., $10) or Fine.Amount.Item (e.g., 2 crates of beer).
     */
    export type Amount =
        | Amount.Money
        | Amount.Item;

    export namespace Amount {

        /**
         * Represents a fine amount as a monetary value.
         */
        export class Money implements Flattable<Money.Flatten> {

            /**
             * Creates a new monetary fine amount.
             *
             * @param amount - The monetary amount
             */
            public constructor(
                public amount: MoneyValue
            ) {}

            /**
             * Returns a formatted string representation of the amount.
             *
             * @param currency - The currency code
             * @param locale - The locale for formatting
             * @returns Formatted currency string (e.g., "$10.50")
             */
            public formatted(currency: Currency, locale: Locale): string {
                return this.amount.formatted(currency, locale);
            }

            /**
             * Returns a new Money instance with the amount multiplied by a factor.
             *
             * @param factor - The multiplication factor
             * @returns New Money instance with multiplied amount
             */
            public multiplied(factor: number): Money {
                return new Money(this.amount.multiplied(factor));
            }

            /**
             * Returns the flattened representation for serialization.
             */
            public get flatten(): Money.Flatten {
                return {
                    type: 'money',
                    amount: this.amount.flatten
                };
            }
        }

        export namespace Money {

            /**
             * Flattened representation of Money for serialization.
             */
            export type Flatten = {
                type: 'money',
                amount: MoneyValue.Flatten
            }

            /**
             * Type builder for Money serialization/deserialization.
             */
            export class TypeBuilder implements ITypeBuilder<Flatten, Money> {

                /**
                 * Builds a Money instance from flattened data.
                 *
                 * @param value - Flattened money data
                 * @returns Money instance
                 */
                public build(value: Flatten): Money {
                    return new Money(MoneyValue.builder.build(value.amount));
                }
            }

            /**
             * Singleton instance of TypeBuilder for Money.
             */
            export const builder = new TypeBuilder();
        }

        /**
         * Represents a fine amount as a quantity of items.
         */
        export class Item implements Flattable<Item.Flatten> {

            /**
             * Creates a new item fine amount.
             *
             * @param item - The item type (e.g., 'crateOfBeer')
             * @param count - The number of items
             */
            public constructor(
                public item: Item.Type,
                public count: number
            ) {}

            /**
             * Returns a formatted string representation including count.
             *
             * @param currency - The currency (unused for items, included for interface consistency)
             * @param locale - The locale for formatting
             * @returns Formatted string (e.g., "2 crates of beer")
             */
            public formatted(currency: Currency, locale: Locale): string {
                return Localization.shared(locale).fineAmount.item.type[this.item].withCount.value(this.count);
            }

            /**
             * Returns a formatted string representation without explicitly showing count.
             *
             * @param locale - The locale for formatting
             * @returns Formatted string without count display
             */
            public formattedWithoutCount(locale: Locale): string {
                return Localization.shared(locale).fineAmount.item.type[this.item].withoutCount.value(this.count);
            }

            /**
             * Returns a new Item instance with the count multiplied by a factor.
             *
             * @param factor - The multiplication factor
             * @returns New Item instance with multiplied count
             */
            public multiplied(factor: number): Item {
                return new Item(this.item, this.count * factor);
            }

            /**
             * Returns the flattened representation for serialization.
             */
            public get flatten(): Item.Flatten {
                return {
                    type: 'item',
                    item: this.item,
                    count: this.count
                };
            }
        }

        export namespace Item {

            const itemTypes = ['crateOfBeer'] as const;

            /**
             * Item type: currently only 'crateOfBeer'.
             */
            export type Type = typeof itemTypes[number];

            export namespace Type {

                /**
                 * Array containing all possible item types.
                 */
                export const all: readonly Type[] = itemTypes;

                /**
                 * Returns the localized name for an item type.
                 *
                 * @param type - The item type
                 * @param locale - The locale to use for formatting
                 * @returns Localized item name
                 */
                export function formatted(type: Type, locale: Locale): string {
                    return Localization.shared(locale).fineAmount.item.type[type].name.value();
                }

                /**
                 * Type builder for Item.Type serialization/deserialization.
                 */
                export const builder = new ValueTypeBuilder<Type>();
            }

            /**
             * Flattened representation of Item for serialization.
             */
            export type Flatten = {
                type: 'item',
                item: Item.Type,
                count: number
            }

            /**
             * Type builder for Item serialization/deserialization.
             */
            export class TypeBuilder implements ITypeBuilder<Flatten, Item> {

                /**
                 * Builds an Item instance from flattened data.
                 *
                 * @param value - Flattened item data
                 * @returns Item instance
                 */
                public build(value: Flatten): Item {
                    return new Item(value.item, value.count);
                }
            }

            /**
             * Singleton instance of TypeBuilder for Item.
             */
            export const builder = new TypeBuilder();
        }

        /**
         * Creates a monetary fine amount.
         *
         * @param amount - The monetary amount
         * @returns Money instance
         */
        export function money(amount: MoneyValue): Money {
            return new Money(amount);
        }

        /**
         * Creates an item fine amount.
         *
         * @param item - The item type
         * @param count - The number of items
         * @returns Item instance
         */
        export function item(item: Item.Type, count: number): Item {
            return new Item(item, count);
        }

        /**
         * Compares two fine amounts and returns their relative ordering.
         *
         * Money amounts are considered greater than Item amounts.
         * Within the same type, values are compared numerically.
         *
         * @param lhs - First fine amount to compare
         * @param rhs - Second fine amount to compare
         * @returns 'less' if lhs < rhs, 'equal' if lhs === rhs, 'greater' if lhs > rhs
         */
        export function compare(lhs: Amount, rhs: Amount): 'less' | 'equal' | 'greater' {
            if (lhs instanceof Money) {
                if (!(rhs instanceof Money))
                    return 'greater';
                const lhsAmount = lhs.amount.completeValue;
                const rhsAmount = rhs.amount.completeValue;
                if (lhsAmount !== rhsAmount)
                    return lhsAmount < rhsAmount ? 'less' : 'greater';
            }
            if (lhs instanceof Item) {
                if (!(rhs instanceof Item))
                    return 'less';
                if (lhs.count === rhs.count)
                    return 'equal';
                return lhs.count < rhs.count ? 'less' : 'greater';
            }
            return 'equal';
        }

        /**
         * Flattened representation of Amount (union of Money.Flatten and Item.Flatten).
         */
        export type Flatten = Money.Flatten | Item.Flatten;

        /**
         * Type builder for Amount serialization/deserialization.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, Amount> {

            /**
             * Builds an Amount instance from flattened data.
             *
             * Determines the type based on the 'type' discriminator field.
             *
             * @param value - Flattened fine amount data
             * @returns Amount instance (Money or Item)
             */
            public build(value: Flatten): Amount {
                switch (value.type) {
                case 'money':
                    return Money.builder.build(value);
                case 'item':
                    return Item.builder.build(value);
                }
            }
        }

        /**
         * Singleton instance of TypeBuilder for Amount.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Flattened representation of a Fine for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        payedState: PayedState,
        date: UtcDate.Flatten,
        reason: string,
        amount: Amount.Flatten
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
                Amount.builder.build(value.amount)
            );
        }
    }

    /**
     * Singleton instance of TypeBuilder for Fine.
     */
    export const builder = new TypeBuilder();
}
