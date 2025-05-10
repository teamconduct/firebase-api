import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Configuration } from './Configuration';

export class MoneyAmount implements Flattable<MoneyAmount.Flatten> {

    public constructor(
        public value: number,
        public subunitValue: number
    ) {}

    public static get zero(): MoneyAmount {
        return new MoneyAmount(0, 0);
    }

    public added(amount: MoneyAmount): MoneyAmount {
        const subunitValue = this.subunitValue + amount.subunitValue;
        const value = this.value + amount.value + Math.floor(subunitValue / 100);
        return new MoneyAmount(value, subunitValue % 100);
    }

    public multiplied(factor: number): MoneyAmount {
        const subunitValue = this.subunitValue * factor;
        const value = this.value * factor + Math.floor(subunitValue / 100);
        return new MoneyAmount(value, subunitValue % 100);
    }

    public formatted(currency: Configuration.Currency, configuration: Configuration): string {
        const numberFormat = Intl.NumberFormat(configuration.locale, {
            style: 'currency',
            currency: currency
        });
        return numberFormat.format(this.value + this.subunitValue / 100);
    }

    public get flatten(): MoneyAmount.Flatten {
        return this.value + this.subunitValue / 100;
    }
}

export namespace MoneyAmount {

    export type Flatten = number;

    export class TypeBuilder implements ITypeBuilder<Flatten, MoneyAmount> {

        public build(value: Flatten): MoneyAmount {
            return new MoneyAmount(Math.floor(value), Math.round((value - Math.floor(value)) * 100));
        }
    }

    export const builder = new MoneyAmount.TypeBuilder();
}
