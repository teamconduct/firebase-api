import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

/**
 * Array of all available currencies.
 */
const currencies = ['EUR', 'USD'] as const;

/**
 * Supported currency types.
 */
export type Currency = typeof currencies[number];

export namespace Currency {

    /**
     * Array of all available currencies.
     */
    export const all: readonly Currency[] = currencies;

    /**
     * Builder for constructing Currency values.
     */
    export const builder = new ValueTypeBuilder<Currency>();
}
