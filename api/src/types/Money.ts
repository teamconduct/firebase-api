import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Currency } from './Currency';
import { Locale } from './localization/Locale';

/**
 * Represents a monetary amount with integer value and subunit components.
 *
 * Stores money as two parts: main value (e.g., dollars) and subunit value (e.g., cents).
 * This prevents floating-point precision issues in financial calculations.
 */
export class Money implements Flattable<Money.Flatten> {

    /**
     * Creates a new Money instance.
     *
     * @param value - The main value (e.g., dollars, euros)
     * @param subunitValue - The subunit value (e.g., cents), should be 0-99
     */
    public constructor(
        public value: number,
        public subunitValue: number
    ) {}

    /**
     * Returns a Money instance representing zero.
     */
    public static get zero(): Money {
        return new Money(0, 0);
    }

    /**
     * Adds another Money instance to this one and returns the result.
     *
     * Properly handles subunit overflow (e.g., 50 cents + 60 cents = 1 dollar 10 cents).
     *
     * @param amount - The Money instance to add
     * @returns A new Money instance representing the sum
     */
    public added(amount: Money): Money {
        const subunitValue = this.subunitValue + amount.subunitValue;
        const value = this.value + amount.value + Math.floor(subunitValue / 100);
        return new Money(value, subunitValue % 100);
    }

    /**
     * Multiplies this Money instance by a factor and returns the result.
     *
     * Properly handles subunit calculations and overflow.
     *
     * @param factor - The multiplication factor
     * @returns A new Money instance representing the product
     */
    public multiplied(factor: number): Money {
        const subunitValue = this.subunitValue * factor;
        const value = this.value * factor + Math.floor(subunitValue / 100);
        return new Money(value, subunitValue % 100);
    }

    /**
     * Returns a localized formatted string representation of the amount.
     *
     * Uses Intl.NumberFormat for proper currency formatting based on locale.
     *
     * @param currency - The currency code (e.g., 'USD', 'EUR')
     * @param locale - The locale information for formatting
     * @returns Formatted currency string (e.g., "$12.50", "12,50 €")
     */
    public formatted(currency: Currency, locale: Locale): string {
        const numberFormat = Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        });
        return numberFormat.format(this.value + this.subunitValue / 100);
    }

    /**
     * Returns the complete monetary value as a decimal number.
     *
     * @returns The total value (e.g., 12.50 for 12 dollars and 50 cents)
     */
    public get completeValue(): number {
        return this.value + this.subunitValue / 100;
    }

    /**
     * Returns the flattened representation as a decimal number.
     */
    public get flatten(): Money.Flatten {
        return this.value + this.subunitValue / 100;
    }
}

export namespace Money {

    /**
     * Flattened representation of Money as a decimal number.
     */
    export type Flatten = number;

    /**
     * Type builder for Money serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, Money> {

        /**
         * Builds a Money instance from a flattened decimal value.
         *
         * Separates the decimal into integer and subunit parts.
         *
         * @param value - Decimal value (e.g., 12.50)
         * @returns Money instance
         */
        public build(value: Flatten): Money {
            return new Money(Math.floor(value), Math.round((value - Math.floor(value)) * 100));
        }
    }

    /**
     * Singleton instance of TypeBuilder for Money.
     */
    export const builder = new Money.TypeBuilder();
}
