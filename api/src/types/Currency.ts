import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

/**
 * Supported currency types.
 */
export type Currency = 'EUR' | 'USD';

export namespace Currency {

    /**
     * Array of all available currencies.
     */
    export const all: Currency[] = ['EUR', 'USD'];

    /**
     * Builder for constructing Currency values.
     */
    export const builder = new ValueTypeBuilder<Currency>();
}
