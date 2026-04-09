import { Flattable, Guid, ITypeBuilder, Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Fine } from './Fine';
import { Localization } from '../localization/Localization';
import { Locale } from '../localization/Locale';

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
        public amount: Fine.Amount,
        public repetition: FineTemplate.Repetition | null
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
     * Represents how a fine template repeats over time.
     *
     * Defines the repetition unit (minute, day, item, count) and optional maximum count for repetitions.
     */
    export class Repetition implements Flattable<Repetition.Flatten> {

        /**
         * Creates a new Repetition instance.
         *
         * @param item - The repetition unit type (minute, day, item, count)
         * @param maxCount - Optional maximum number of repetitions (null for unlimited)
         */
        public constructor(
            public item: Repetition.Item,
            public maxCount: number | null
        ) {}

        /**
         * Returns a localized formatted string including the count value.
         *
         * @param count - The number of repetitions
         * @param locale - The locale to use for formatting
         * @returns Formatted string (e.g., "every 5 minutes")
         */
        public formatted(count: number, locale: Locale): string {
            return Localization.shared(locale).fineTemplateRepetition.item[this.item].withCount.value(count);
        }

        /**
         * Returns a localized formatted string without explicitly showing the count.
         *
         * @param count - The number of repetitions
         * @param locale - The locale to use for formatting
         * @returns Formatted string without count display
         */
        public formattedWithoutCount(count: number, locale: Locale): string {
            return Localization.shared(locale).fineTemplateRepetition.item[this.item].withoutCount.value(count);
        }

        /**
         * Returns the flattened representation for serialization.
         */
        public get flatten(): Repetition.Flatten {
            return {
                item: this.item,
                maxCount: this.maxCount
            };
        }
    }

    export namespace Repetition {

        const repetitionItems = [
            'minute',
            'day',
            'item',
            'count'
        ] as const;

        /**
         * Repetition unit type: 'minute', 'day', 'item', or 'count'.
         */
        export type Item = typeof repetitionItems[number];

        export namespace Item {

            /**
             * Array containing all possible repetition item types.
             */
            export const all: readonly Item[] = repetitionItems;

            /**
             * Returns the localized name for a repetition item type.
             *
             * @param item - The repetition item type
             * @param locale - The locale to use for formatting
             * @returns Localized name string
             */
            export function formatted(item: Item, locale: Locale): string {
                return Localization.shared(locale).fineTemplateRepetition.item[item].name.value();
            }

            /**
             * Type builder for Item serialization/deserialization.
             */
            export const builder = new ValueTypeBuilder<Item>();
        }

        /**
         * Flattened representation of Repetition for serialization.
         */
        export type Flatten = {
            item: Item,
            maxCount: number | null
        }

        /**
         * Type builder for Repetition serialization/deserialization.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, Repetition> {

            /**
             * Builds a Repetition instance from flattened data.
             *
             * @param flatten - Flattened repetition data
             * @returns Repetition instance
             */
            public build(flatten: Flatten): Repetition {
                return new Repetition(
                    flatten.item,
                    flatten.maxCount
                );
            }
        }

        /**
         * Singleton instance of TypeBuilder for Repetition.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Flattened representation of a FineTemplate for serialization.
     */
    export type Flatten = {
        id: Id.Flatten,
        reason: string,
        amount: Fine.Amount.Flatten,
        repetition: Repetition.Flatten | null
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
                Fine.Amount.builder.build(value.amount),
                value.repetition === null ? null : Repetition.builder.build(value.repetition)
            );
        }
    }

    /**
     * Singleton instance of TypeBuilder for FineTemplate.
     */
    export const builder = new TypeBuilder();
}
