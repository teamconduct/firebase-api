import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Localization } from './Localization';

export type PayedState =
    | 'payed'
    | 'notPayed';

export namespace PayedState {

    export const all: PayedState[] = ['payed', 'notPayed'];

    export function formatted(state: PayedState): string {
        return Localization.shared.get(key => key.payedState[state]);
    }

    export function toggled(state: PayedState): PayedState {
        switch (state) {
        case 'payed':
            return 'notPayed';
        case 'notPayed':
            return 'payed';
        }
    }

    export function payedTag(state: PayedState): { value: string; severity: 'secondary' | 'danger' } {
        switch (state) {
        case 'payed':
            return {
                value: formatted(state),
                severity: 'secondary'
            };
        case 'notPayed':
            return {
                value: formatted(state),
                severity: 'danger'
            };
        }
    }

    export const builder = new ValueTypeBuilder<PayedState>();
}
