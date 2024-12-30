import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type PayedState =
    | 'payed'
    | 'notPayed';

export namespace PayedState {

    export const all: PayedState[] = ['payed', 'notPayed'];

    export const builder = new ValueTypeBuilder<PayedState>();
}
