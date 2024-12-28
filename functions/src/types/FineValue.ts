import { Flatten, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { Amount } from './Amount';
import { UnionTypeBuilder } from './UnionTypeBuilder';
import * as i18n from 'i18n';

export type FineValueItem =
    | 'crateOfBeer';

export type FineValue =
    | FineValue._Amount
    | FineValue.Item;

export namespace FineValue {

    export function amount(amount: Amount): FineValue._Amount {
        return {
            type: 'amount',
            amount: amount
        };
    }

    export function item(item: FineValueItem, count: number): FineValue.Item {
        return {
            type: 'item',
            item: item,
            count: count
        };
    }

    export type _Amount = {
        type: 'amount',
        amount: Amount
    }

    export type Item ={
        type: 'item',
        item: FineValueItem,
        count: number
    }

    const amountBuilder = new ObjectTypeBuilder<Flatten<FineValue._Amount>, FineValue._Amount>({
        type: new ValueTypeBuilder(),
        amount: Amount.builder
    });

    const itemBuilder = new ObjectTypeBuilder<Flatten<FineValue.Item>, FineValue.Item>({
        type: new ValueTypeBuilder(),
        item: new ValueTypeBuilder(),
        count: new ValueTypeBuilder()
    });

    export const builder = new UnionTypeBuilder<Flatten<FineValue._Amount>, Flatten<FineValue.Item>, FineValue._Amount, FineValue.Item>((value): value is Flatten<FineValue._Amount> => value.type === 'amount', amountBuilder, itemBuilder);

    export function format(fineValue: FineValue): string {
        switch (fineValue.type) {
        case 'amount':
            return fineValue.amount.formatted();
        case 'item': {
            const numberFormat = Intl.NumberFormat(i18n.getLocale(), {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            if (fineValue.count === 1)
                return i18n.__(`fineValue.${fineValue.item}-singular`, numberFormat.format(fineValue.count));
            return i18n.__(`fineValue.${fineValue.item}-plural`, numberFormat.format(fineValue.count));
        }
        }
    }
}
