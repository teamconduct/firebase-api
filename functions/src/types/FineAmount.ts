import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { MoneyAmount } from './MoneyAmount';
import * as i18n from 'i18n';
import { Configuration } from './Configuration';

export type FineAmount =
    | FineAmount.Money
    | FineAmount.Item;

export namespace FineAmount {

    export class Money implements Flattable<Money.Flatten> {

        public constructor(
            public amount: MoneyAmount
        ) {}

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public formatted(configuration: Configuration): string {
            return this.amount.formatted(configuration.currency);
        }

        public get flatten(): Money.Flatten {
            return {
                type: 'money',
                amount: this.amount.flatten
            };
        }
    }

    export namespace Money {

        export type Flatten = {
            type: 'money',
            amount: MoneyAmount.Flatten
        }

        export class TypeBuilder implements ITypeBuilder<Flatten, Money> {

            public build(value: Flatten): Money {
                return new Money(MoneyAmount.builder.build(value.amount));
            }
        }

        export const builder = new TypeBuilder();
    }

    export class Item implements Flattable<Item.Flatten> {

        public constructor(
            public item: Item.Type,
            public count: number
        ) {}

        public formatted(configuration: Configuration): string {
            const numberFormat = Intl.NumberFormat(configuration.locale, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            if (this.count === 1)
                return i18n.__(`FineAmount.Item.Type.${this.item}.singular`, numberFormat.format(this.count));
            return i18n.__(`FineAmount.Item.Type.${this.item}.plural`, numberFormat.format(this.count));
        }

        public get flatten(): Item.Flatten {
            return {
                type: 'item',
                item: this.item,
                count: this.count
            };
        }
    }

    export namespace Item {

        export type Type =
            | 'crateOfBeer';

        export namespace Type {

            export const all: Type[] = ['crateOfBeer'];
        }

        export type Flatten = {
            type: 'item',
            item: Item.Type,
            count: number
        }

        export class TypeBuilder implements ITypeBuilder<Flatten, Item> {

            public build(value: Flatten): Item {
                return new Item(value.item, value.count);
            }
        }

        export const builder = new TypeBuilder();
    }


    export function money(MoneyAmount: MoneyAmount): Money {
        return new Money(MoneyAmount);
    }

    export function item(item: Item.Type, count: number): Item {
        return new Item(item, count);
    }

    export type Flatten = Money.Flatten | Item.Flatten;

    export class TypeBuilder implements ITypeBuilder<Flatten, FineAmount> {

        public build(value: Flatten): FineAmount {
            switch (value.type) {
            case 'money':
                return Money.builder.build(value);
            case 'item':
                return Item.builder.build(value);
            }
        }
    }

    export const builder = new TypeBuilder();
}
