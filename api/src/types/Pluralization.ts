/**
 * Handles pluralization of strings based on count values.
 * Supports different plural forms for various count categories (zero, one, two, few, many, other).
 * This follows the Unicode CLDR plural rules for internationalization.
 */
export class Pluralization {

    /**
     * Plural form for count = 0 (optional).
     */
    private readonly zero: string | null;

    /**
     * Plural form for count = 1 (optional).
     */
    private readonly one: string | null;

    /**
     * Plural form for count = 2 (optional).
     */
    private readonly two: string | null;

    /**
     * Plural form for count > 1 and < 5 (optional).
     */
    private readonly few: string | null;

    /**
     * Plural form for count >= 5 and <= 20 (optional).
     */
    private readonly many: string | null;

    /**
     * Default plural form used when no other category matches (required).
     */
    private readonly other: string;

    /**
     * Creates a new Pluralization instance with specified plural forms.
     * @param countLocals - Object containing plural forms for different count categories
     * @param countLocals.zero - Optional form for zero items
     * @param countLocals.one - Optional form for one item
     * @param countLocals.two - Optional form for two items
     * @param countLocals.few - Optional form for a few items (2-4)
     * @param countLocals.many - Optional form for many items (5-20)
     * @param countLocals.other - Required default form for all other counts
     */
    public constructor(countLocals: {
        zero?: string,
        one?: string,
        two?: string,
        few?: string,
        many?: string,
        other: string
    }) {
        this.zero = countLocals.zero ?? null;
        this.one = countLocals.one ?? null;
        this.two = countLocals.two ?? null;
        this.few = countLocals.few ?? null;
        this.many = countLocals.many ?? null;
        this.other = countLocals.other;
    }

    /**
     * Returns the appropriate plural form for the given count.
     * Applies the following rules in order:
     * - count = 0: returns 'zero' form if defined
     * - count = 1: returns 'one' form if defined
     * - count = 2: returns 'two' form if defined
     * - 1 < count < 5: returns 'few' form if defined
     * - 5 <= count <= 20: returns 'many' form if defined
     * - Otherwise: returns 'other' form
     *
     * @param count - The number to determine the plural form for
     * @returns The appropriate plural form string for the given count
     */
    public get(count: number): string {
        if (count === 0 && this.zero)
            return this.zero;
        else if (count === 1 && this.one)
            return this.one;
        else if (count === 2 && this.two)
            return this.two;
        else if (count > 1 && count < 5 && this.few)
            return this.few;
        else if (count >= 5 && count <= 20 && this.many)
            return this.many;
        return this.other;
    }
}
