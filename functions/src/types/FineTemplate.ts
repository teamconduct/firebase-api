import { Flatten, Guid, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder, OptionalTypeBuilder, Tagged, TaggedTypeBuilder } from 'firebase-function';
import { FineTemplateMultiple } from './FineTemplateMultiple';
import { FineValue } from './FineValue';

export type FineTemplateId = Tagged<Guid, 'fineTemplate'>;

export namespace FineTemplateId {
    export const builder = new TaggedTypeBuilder<string, FineTemplateId>('fineTemplate', new TypeBuilder(Guid.from));
}

export type FineTemplate = {
    id: FineTemplateId,
    reason: string,
    value: FineValue,
    multiple: FineTemplateMultiple | null
}

export namespace FineTemplate {
    export const builder = new ObjectTypeBuilder<Flatten<FineTemplate>, FineTemplate>({
        id: FineTemplateId.builder,
        reason: new ValueTypeBuilder(),
        value: FineValue.builder,
        multiple: new OptionalTypeBuilder(FineTemplateMultiple.builder)
    });
}
