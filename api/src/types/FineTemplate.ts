import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';
import { FineAmount } from './FineAmount';
import { FineTemplateRepetition } from './FineTemplateRepetition';

/**
 * Represents a template for creating fines with predefined reason, amount, and optional repetition rules.
 *
 * Fine templates allow teams to quickly create recurring or standard fines without entering
 * the same information repeatedly.
 */
export class FineTemplate implements Flattable<FineTemplate.Flatten> {

    /**
     * Creates a new FineTemplate instance.
     *
     * @param id - Unique identifier for the fine template (GUID)
     * @param reason - The reason or description for the fine
     * @param amount - The monetary or item-based amount of the fine
     * @param repetition - Optional repetition rules (null for non-recurring templates)
     */
    public constructor(
        public id: FineTemplate.Id,
        public reason: string,
        public amount: FineAmount,
        public repetition: FineTemplateRepetition | null
    ) {}

    /**
     * Returns the flattened representation for serialization.
     */
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

    /**
     * Tagged GUID type for fine template identifiers.
     */
    export type Id = Tagged<Guid, 'fineTemplate'>;

    export namespace Id {

        /**
         * Flattened representation of a fine template ID (GUID string).
         */
        export type Flatten = string;

        /**
         * Type builder for FineTemplate.Id serialization/deserialization.
         */
        export const builder = Tagged.builder('fineTemplate' as const, Guid.builder);
    }

    /**
     * Flattened representation of a FineTemplate for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        reason: string,
        amount: FineAmount.Flatten,
        repetition: FineTemplateRepetition.Flatten | null
    };

    /**
     * Type builder for FineTemplate serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, FineTemplate> {

        /**
         * Builds a FineTemplate instance from flattened data.
         *
         * @param value - Flattened fine template data
         * @returns FineTemplate instance
         */
        public build(value: Flatten): FineTemplate {
            return new FineTemplate(
                Id.builder.build(value.id),
                value.reason,
                FineAmount.builder.build(value.amount),
                value.repetition === null ? null : FineTemplateRepetition.builder.build(value.repetition)
            );
        }
    }

    /**
     * Singleton instance of TypeBuilder for FineTemplate.
     */
    export const builder = new TypeBuilder();
}
