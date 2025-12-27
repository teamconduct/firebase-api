import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Configuration } from './Configuration';
import { Currency } from './Currency';

/**
 * Represents a monetary amount with integer value and subunit components.
 *
 * Stores money as two parts: main value (e.g., dollars) and subunit value (e.g., cents).
 * This prevents floating-point precision issues in financial calculations.
 */
export class MoneyAmount implements Flattable<MoneyAmount.Flatten> {

    /**
     * Creates a new MoneyAmount instance.
     *
     * @param value - The main value (e.g., dollars, euros)
     * @param subunitValue - The subunit value (e.g., cents), should be 0-99
     */
    public constructor(
        public value: number,
        public subunitValue: number
    ) {}

    /**
     * Returns a MoneyAmount representing zero.
     */
    public static get zero(): MoneyAmount {
        return new MoneyAmount(0, 0);
    }

    /**
     * Adds another MoneyAmount to this one and returns the result.
     *
     * Properly handles subunit overflow (e.g., 50 cents + 60 cents = 1 dollar 10 cents).
     *
     * @param amount - The MoneyAmount to add
     * @returns A new MoneyAmount representing the sum
     */
    public added(amount: MoneyAmount): MoneyAmount {
        const subunitValue = this.subunitValue + amount.subunitValue;
        const value = this.value + amount.value + Math.floor(subunitValue / 100);
        return new MoneyAmount(value, subunitValue % 100);
    }

    /**
     * Multiplies this MoneyAmount by a factor and returns the result.
     *
     * Properly handles subunit calculations and overflow.
     *
     * @param factor - The multiplication factor
     * @returns A new MoneyAmount representing the product
     */
    public multiplied(factor: number): MoneyAmount {
        const subunitValue = this.subunitValue * factor;
        const value = this.value * factor + Math.floor(subunitValue / 100);
        return new MoneyAmount(value, subunitValue % 100);
    }

    /**
     * Returns a localized formatted string representation of the amount.
     *
     * Uses Intl.NumberFormat for proper currency formatting based on locale.
     *
     * @param currency - The currency code (e.g., 'USD', 'EUR')
     * @param configuration - Configuration containing locale information
     * @returns Formatted currency string (e.g., "$12.50", "12,50 €")
     */
    public formatted(currency: Currency, configuration: Configuration): string {
        const numberFormat = Intl.NumberFormat(configuration.locale, {
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
    public get flatten(): MoneyAmount.Flatten {
        return this.value + this.subunitValue / 100;
    }
}

export namespace MoneyAmount {

    /**
     * Flattened representation of MoneyAmount as a decimal number.
     */
    export type Flatten = number;

    /**
     * Type builder for MoneyAmount serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, MoneyAmount> {

        /**
         * Builds a MoneyAmount instance from a flattened decimal value.
         *
         * Separates the decimal into integer and subunit parts.
         *
         * @param value - Decimal value (e.g., 12.50)
         * @returns MoneyAmount instance
         */
        public build(value: Flatten): MoneyAmount {
            return new MoneyAmount(Math.floor(value), Math.round((value - Math.floor(value)) * 100));
        }
    }

    /**
     * Singleton instance of TypeBuilder for MoneyAmount.
     */
    export const builder = new MoneyAmount.TypeBuilder();
}
