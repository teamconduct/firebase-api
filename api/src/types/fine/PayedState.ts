import { Flattable, ITypeBuilder, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { Localization } from '../localization/Localization';
import { Locale } from '../localization/Locale';

/**
 * Represents the payment status of a fine.
 *
 * Can be either Payed (with the date it was paid) or NotPayed.
 */
export type PayedState =
    | PayedState.Payed
    | PayedState.NotPayed;

export namespace PayedState {

    /**
     * Represents a fine that has been paid, including the date of payment.
     */
    export class Payed implements Flattable<Payed.Flatten> {

        public readonly type = 'payed' as const;

        public constructor(
            public payedDate: UtcDate
        ) {}

        public get flatten(): Payed.Flatten {
            return {
                type: 'payed',
                payedDate: this.payedDate.flatten
            };
        }
    }

    export namespace Payed {

        export type Flatten = {
            type: 'payed',
            payedDate: UtcDate.Flatten
        };

        export class TypeBuilder implements ITypeBuilder<Flatten, Payed> {
            public build(value: Flatten): Payed {
                return new Payed(UtcDate.builder.build(value.payedDate));
            }
        }

        export const builder = new TypeBuilder();
    }

    /**
     * Represents a fine that has not yet been paid.
     */
    export class NotPayed implements Flattable<NotPayed.Flatten> {

        public readonly type = 'notPayed' as const;

        public get flatten(): NotPayed.Flatten {
            return { type: 'notPayed' };
        }
    }

    export namespace NotPayed {

        export type Flatten = {
            type: 'notPayed'
        };

        export class TypeBuilder implements ITypeBuilder<Flatten, NotPayed> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            public build(_value: Flatten): NotPayed {
                return new NotPayed();
            }
        }

        export const builder = new TypeBuilder();
    }

    /**
     * Flattened representation of PayedState for serialization.
     */
    export type Flatten = Payed.Flatten | NotPayed.Flatten;

    /**
     * Type builder for PayedState serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, PayedState> {
        public build(value: Flatten): PayedState {
            switch (value.type) {
            case 'payed':
                return Payed.builder.build(value);
            case 'notPayed':
                return NotPayed.builder.build(value);
            }
        }
    }

    export const builder = new TypeBuilder();

    /**
     * Returns the localized display string for a payment state.
     *
     * @param state - The payment state to format
     * @param locale - The locale to use for formatting
     * @returns Localized string representation of the payment state
     */
    export function formatted(state: PayedState, locale: Locale): string {
        return Localization.shared(locale).payedState[state.type].value();
    }

    /**
     * Toggles the payment state. Toggling to 'payed' uses the current date.
     *
     * @param state - The current payment state
     * @returns The toggled payment state
     */
    export function toggled(state: PayedState): PayedState {
        switch (state.type) {
        case 'payed':
            return new NotPayed();
        case 'notPayed':
            return new Payed(UtcDate.now);
        }
    }

    /**
     * Creates a payed state with the given date.
     */
    export function payed(payedDate: UtcDate): Payed {
        return new Payed(payedDate);
    }

    /**
     * Creates a notPayed state.
     */
    export function notPayed(): NotPayed {
        return new NotPayed();
    }
}
