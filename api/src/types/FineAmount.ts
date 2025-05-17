import { Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { MoneyAmount } from './MoneyAmount';
import { Configuration } from './Configuration';
import { Localization } from './Localization';

export type FineAmount =
    | FineAmount.Money
    | FineAmount.Item;

export namespace FineAmount {

    export class Money implements Flattable<Money.Flatten> {

        public constructor(
            public amount: MoneyAmount
        ) {}

        public formatted(configuration: Configuration): string {
            return this.amount.formatted(configuration.currency, configuration);
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

        public formatted(): string {
            return Localization.shared.getN(key => key.fineAmount.item.type[this.item], this.count);
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

            export function formatted(type: Type): string {
                return Localization.shared.get(key => key.fineAmount.item.type[type]);
            }
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
