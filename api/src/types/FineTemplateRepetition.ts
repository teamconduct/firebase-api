import { Flattable, ITypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization } from './Localization';
import { Locale } from './Locale';

/**
 * Represents how a fine template repeats over time.
 *
 * Defines the repetition unit (minute, day, item, count) and optional maximum count for repetitions.
 */
export class FineTemplateRepetition implements Flattable<FineTemplateRepetition.Flatten> {

    /**
     * Creates a new FineTemplateRepetition instance.
     *
     * @param item - The repetition unit type (minute, day, item, count)
     * @param maxCount - Optional maximum number of repetitions (null for unlimited)
     */
    public constructor(
        public item: FineTemplateRepetition.Item,
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
    public get flatten(): FineTemplateRepetition.Flatten {
        return {
            item: this.item,
            maxCount: this.maxCount
        };
    }
}

export namespace FineTemplateRepetition {

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
     * Flattened representation of FineTemplateRepetition for serialization.
     */
    export type Flatten = {
        item: Item,
        maxCount: number | null
    }

    /**
     * Type builder for FineTemplateRepetition serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, FineTemplateRepetition> {

        /**
         * Builds a FineTemplateRepetition instance from flattened data.
         *
         * @param flatten - Flattened repetition data
         * @returns FineTemplateRepetition instance
         */
        public build(flatten: Flatten): FineTemplateRepetition {
            return new FineTemplateRepetition(
                flatten.item,
                flatten.maxCount
            );
        }
    }

    /**
     * Singleton instance of TypeBuilder for FineTemplateRepetition.
     */
    export const builder = new TypeBuilder();
}
