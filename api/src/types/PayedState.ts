import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization } from './Localization';
import { Locale } from './Locale';

const payedStates = ['payed', 'notPayed'] as const;

/**
 * Represents the payment status of a fine.
 *
 * Can be either 'payed' (fine has been paid) or 'notPayed' (fine is unpaid).
 */
export type PayedState = typeof payedStates[number];

export namespace PayedState {

    /**
     * Array containing all possible payment states.
     */
    export const all: readonly PayedState[] = payedStates;

    /**
     * Returns the localized display string for a payment state.
     *
     * @param state - The payment state to format
     * @param locale - The locale to use for formatting
     * @returns Localized string representation of the payment state
     */
    export function formatted(state: PayedState, locale: Locale): string {
        return Localization.shared(locale).payedState[state].value();
    }

    /**
     * Toggles the payment state between 'payed' and 'notPayed'.
     *
     * @param state - The current payment state
     * @returns The toggled payment state
     */
    export function toggled(state: PayedState): PayedState {
        switch (state) {
        case 'payed':
            return 'notPayed';
        case 'notPayed':
            return 'payed';
        }
    }

    /**
     * Type builder for PayedState serialization/deserialization.
     */
    export const builder = new ValueTypeBuilder<PayedState>();
}
