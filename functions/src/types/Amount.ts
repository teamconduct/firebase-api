import { Flattable, Flatten, TypeBuilder } from 'firebase-function';
import * as i18n from 'i18n';

export class Amount implements Flattable<number> {

    public constructor(
        public readonly value: number,
        public readonly subunitValue: number
    ) {}

    public static from(value: number): Amount {
        return new Amount(
            Math.floor(value),
            Math.round((value - Math.floor(value)) * 100)
        );
    }

    public get completeValue(): number {
        return this.value + this.subunitValue / 100;
    }

    public formatted(currency: string = 'EUR'): string {
        const numberFormat = Intl.NumberFormat(i18n.getLocale(), {
            style: 'currency',
            currency: currency
        });
        return numberFormat.format(this.completeValue);
    }

    public get flatten(): number {
        return this.completeValue;
    }
}

export namespace Amount {
    export const builder = new TypeBuilder<Flatten<Amount>, Amount>(Amount.from);
}
