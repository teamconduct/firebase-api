/**
 * Handles localization strings with template variable substitution.
 * Supports {{variableName}} syntax for runtime value replacement.
 */
export class ValueLocalization {

    /**
     * Creates a new ValueLocalization instance.
     *
     * @param rawValue - The template string with {{variable}} placeholders
     */
    constructor(private readonly rawValue: string) {}

    /**
     * Returns the localized string with variables substituted.
     * Template variables in the format {{key}} are replaced with provided argument values.
     *
     * @param args - Record of variable names to their replacement values
     * @returns The localized string with all variables replaced
     * @throws Error if a required template variable is not provided in args
     */
    public value(args: Record<string, string> = {}): string {
        let rawValue = this.rawValue;
        const regex = /\{\{(?<key>.*?)\}\}/;
        while (true) {
            const match = regex.exec(rawValue);
            if (!match)
                break;
            const key = match.groups!.key;
            if (!(key in args))
                throw new Error(`Missing argument for key: ${key}`);
            rawValue = rawValue.replace(match[0], args[key]);
        }
        return rawValue;
    }
}
