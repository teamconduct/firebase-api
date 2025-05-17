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

    export const builder = new ValueTypeBuilder<PayedState>();
}
