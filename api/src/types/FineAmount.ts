import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { MoneyAmount } from './MoneyAmount';
import { Configuration } from './Configuration';
import { Localization } from './Localization';
import { Locale } from './Locale';

/**
 * Represents the amount of a fine, either as a monetary value or as items.
 *
 * Can be either FineAmount.Money (e.g., $10) or FineAmount.Item (e.g., 2 crates of beer).
 */
export type FineAmount =
    | FineAmount.Money
    | FineAmount.Item;

export namespace FineAmount {

    /**
     * Represents a fine amount as a monetary value.
     */
    export class Money implements Flattable<Money.Flatten> {

        /**
         * Creates a new Money fine amount.
         *
         * @param amount - The monetary amount
         */
        public constructor(
            public amount: MoneyAmount
        ) {}

        /**
         * Returns a formatted string representation of the amount.
         *
         * @param configuration - Configuration containing currency and locale
         * @returns Formatted currency string (e.g., "$10.50")
         */
        public formatted(configuration: Configuration): string {
            return this.amount.formatted(configuration.currency, configuration);
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
            amount: MoneyAmount.Flatten
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
                return new Money(MoneyAmount.builder.build(value.amount));
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
         * Creates a new Item fine amount.
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
         * @param locale - The locale for formatting
         * @returns Formatted string (e.g., "2 crates of beer")
         */
        public formatted(locale: Locale): string;
        /**
         * Returns a formatted string representation including count.
         *
         * @param configuration - Configuration containing locale
         * @returns Formatted string (e.g., "2 crates of beer")
         */
        public formatted(configuration: Configuration): string;
        public formatted(configurationOrLocale: Configuration | Locale): string {
            const locale = configurationOrLocale instanceof Configuration ? configurationOrLocale.locale : configurationOrLocale;
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
     * Creates a Money fine amount.
     *
     * @param MoneyAmount - The monetary amount
     * @returns Money instance
     */
    export function money(MoneyAmount: MoneyAmount): Money {
        return new Money(MoneyAmount);
    }

    /**
     * Creates an Item fine amount.
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
    export function compare(lhs: FineAmount, rhs: FineAmount): 'less' | 'equal' | 'greater' {
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
     * Flattened representation of FineAmount (union of Money.Flatten and Item.Flatten).
     */
    export type Flatten = Money.Flatten | Item.Flatten;

    /**
     * Type builder for FineAmount serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, FineAmount> {

        /**
         * Builds a FineAmount instance from flattened data.
         *
         * Determines the type based on the 'type' discriminator field.
         *
         * @param value - Flattened fine amount data
         * @returns FineAmount instance (Money or Item)
         */
        public build(value: Flatten): FineAmount {
            switch (value.type) {
            case 'money':
                return Money.builder.build(value);
            case 'item':
                return Item.builder.build(value);
            }
        }
    }

    /**
     * Singleton instance of TypeBuilder for FineAmount.
     */
    export const builder = new TypeBuilder();
}
