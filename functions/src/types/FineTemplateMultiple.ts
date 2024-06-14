import { Flatten, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type FineTemplateMultipleItem =
    | 'minute'
    | 'day'
    | 'item';

export type FineTemplateMultiple = {
    item: FineTemplateMultipleItem,
    maxCount: number | null
}

export namespace FineTemplateMultiple {
    export const builder = new ObjectTypeBuilder<Flatten<FineTemplateMultiple>, FineTemplateMultiple>({
        item: new ValueTypeBuilder(),
        maxCount: new ValueTypeBuilder()
    });
}
