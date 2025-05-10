import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import * as i18n from 'i18n';
import { Configuration } from './Configuration';

export class MoneyAmount implements Flattable<MoneyAmount.Flatten> {

    public constructor(
        public value: number,
        public subunitValue: number
    ) {}

    public static zero(): MoneyAmount {
        return new MoneyAmount(0, 0);
    }

    public formatted(currency: Configuration.Currency): string {
        const numberFormat = Intl.NumberFormat(i18n.getLocale(), {
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
