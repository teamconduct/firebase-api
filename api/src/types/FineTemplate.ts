import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';
import { FineAmount } from './FineAmount';
import { FineTemplateRepetition } from './FineTemplateRepetition';

export class FineTemplate implements Flattable<FineTemplate.Flatten> {

    public constructor(
        public id: FineTemplate.Id,
        public reason: string,
        public amount: FineAmount,
        public repetition: FineTemplateRepetition | null
    ) {}

    public get flatten(): FineTemplate.Flatten {
        return {
            id: this.id.flatten,
            reason: this.reason,
            amount: this.amount.flatten,
            repetition: this.repetition === null ? null : this.repetition.flatten
        };
    }
}

export namespace FineTemplate {

    export type Id = Tagged<Guid, 'fineTemplate'>;

    export namespace Id {

        export type Flatten = string;

        export const builder = Tagged.builder('fineTemplate' as const, Guid.builder);
    }

    export type Flatten = {
        id: Id.Flatten,
        reason: string,
        amount: FineAmount.Flatten,
        repetition: FineTemplateRepetition.Flatten | null
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, FineTemplate> {

        public build(value: Flatten): FineTemplate {
            return new FineTemplate(
                Id.builder.build(value.id),
                value.reason,
                FineAmount.builder.build(value.amount),
                value.repetition === null ? null : FineTemplateRepetition.builder.build(value.repetition)
            );
        }
    }

    export const builder = new TypeBuilder();
}
