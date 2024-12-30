import { Flattable, ITypeBuilder } from "@stevenkellner/typescript-common-functionality";

export class FineTemplateRepetition implements Flattable<FineTemplateRepetition.Flatten> {

    public constructor(
        public item: FineTemplateRepetition.Item,
        public maxCount: number | null
    ) {}

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
