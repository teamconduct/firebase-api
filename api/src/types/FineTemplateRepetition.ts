import { Flattable, ITypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization } from './Localization';
import { Locale } from './Locale';

export class FineTemplateRepetition implements Flattable<FineTemplateRepetition.Flatten> {

    public constructor(
        public item: FineTemplateRepetition.Item,
        public maxCount: number | null
    ) {}

    public formatted(count: number, locale: Locale): string {
        return Localization.shared(locale).fineTemplateRepetition.item[this.item].withCount.value(count);
    }

    public formattedWithoutCount(count: number, locale: Locale): string {
        return Localization.shared(locale).fineTemplateRepetition.item[this.item].withoutCount.value(count);
    }

    public get flatten(): FineTemplateRepetition.Flatten {
        return {
            item: this.item,
            maxCount: this.maxCount
        };
    }
}

export namespace FineTemplateRepetition {

    export type Item =
        | 'minute'
        | 'day'
        | 'item'
        | 'count';

    export namespace Item {

        export const all: Item[] = [
            'minute',
            'day',
            'item',
            'count'
        ];

        export function formatted(item: Item, locale: Locale): string {
            return Localization.shared(locale).fineTemplateRepetition.item[item].name.value();
        }

        export const builder = new ValueTypeBuilder<Item>();
    }

    export type Flatten = {
        item: Item,
        maxCount: number | null
    }

    export class TypeBuilder implements ITypeBuilder<Flatten, FineTemplateRepetition> {

        public build(flatten: Flatten): FineTemplateRepetition {
            return new FineTemplateRepetition(
                flatten.item,
                flatten.maxCount
            );
        }
    }

    export const builder = new TypeBuilder();
}
