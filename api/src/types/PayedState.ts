import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization } from './Localization';
import { Locale } from './Locale';

export type PayedState =
    | 'payed'
    | 'notPayed';

export namespace PayedState {

    export const all: PayedState[] = ['payed', 'notPayed'];

    export function formatted(state: PayedState, locale: Locale): string {
        return Localization.shared(locale).payedState[state].value();
    }

    export function toggled(state: PayedState): PayedState {
        switch (state) {
        case 'payed':
            return 'notPayed';
        case 'notPayed':
            return 'payed';
        }
    }

    export function payedTag(state: PayedState, locale: Locale): { value: string; severity: 'secondary' | 'danger' } {
        switch (state) {
        case 'payed':
            return {
                value: formatted(state, locale),
                severity: 'secondary'
            };
        case 'notPayed':
            return {
                value: formatted(state, locale),
                severity: 'danger'
            };
        }
    }

    export const builder = new ValueTypeBuilder<PayedState>();
}
