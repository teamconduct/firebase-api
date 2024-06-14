import { Flatten, Guid, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder, OptionalTypeBuilder } from 'firebase-function';
import { FineTemplateMultiple } from './FineTemplateMultiple';
import { Amount } from './Amount';

export type FineTemplate = {
    id: Guid,
    reason: string,
    amount: Amount,
    multiple: FineTemplateMultiple | null
}

export namespace FineTemplate {
    export const builder = new ObjectTypeBuilder<Flatten<FineTemplate>, FineTemplate>({
        id: new TypeBuilder(Guid.from),
        reason: new ValueTypeBuilder(),
        amount: Amount.builder,
        multiple: new OptionalTypeBuilder(FineTemplateMultiple.builder)
    });
}
