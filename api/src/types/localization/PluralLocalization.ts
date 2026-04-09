import { Pluralization } from './Pluralization';
import { ValueLocalization } from './ValueLocalization';

/**
 * Handles pluralized localization strings that vary based on count.
 * Combines Pluralization logic with template variable substitution.
 */
export class PluralLocalization {

    /**
     * Creates a new PluralLocalization instance.
     *
     * @param pluralization - The Pluralization instance containing plural forms
     */
    constructor(private readonly pluralization: Pluralization) {}

    /**
     * Returns the appropriate pluralized string for the given count with variables substituted.
     * Automatically includes 'count' in the template variables.
     *
     * @param count - The count to determine which plural form to use
     * @param args - Additional template variables to substitute (count is added automatically)
     * @returns The localized plural string with all variables replaced
     */
    public value(count: number, args: Record<string, string> = {}): string {
        const valueLocalization = new ValueLocalization(this.pluralization.get(count));
        return valueLocalization.value({
            count: `${count}`,
            ...args
        });
    }
}
