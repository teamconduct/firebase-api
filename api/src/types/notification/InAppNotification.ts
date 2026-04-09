import { Flattable, Guid, ITypeBuilder, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { Fine } from '../fine/Fine';
import { Team } from '../team/Team';

/**
 * Represents an in-app notification for a user.
 *
 * Stores information about team and fine events that are delivered
 * as in-app notifications rather than push notifications.
 */
export class InAppNotification implements Flattable<InAppNotification.Flatten> {

    /**
     * Creates a new InAppNotification instance.
     *
     * @param id - Unique identifier for the notification
     * @param date - The date and time the notification was created
     * @param isRead - Whether the notification has been read by the user
     * @param event - The event data describing what triggered the notification
     */
    public constructor(
        public id: InAppNotification.Id,
        public date: UtcDate,
        public isRead: boolean,
        public event: InAppNotification.Event
    ) {}

    /**
     * Returns the flattened representation for serialization.
     */
    public get flatten(): InAppNotification.Flatten {
        return {
            id: this.id.flatten,
            date: this.date.flatten,
            isRead: this.isRead,
            event: InAppNotification.Event.flatten(this.event)
        };
    }
}

export namespace InAppNotification {

    /**
     * Tagged GUID type for in-app notification identifiers.
     */
    export type Id = Tagged<Guid, 'inAppNotification'>;

    export namespace Id {

        /**
         * Flattened representation of a notification ID (GUID string).
         */
        export type Flatten = string;

        /**
         * Type builder for InAppNotification.Id serialization/deserialization.
         */
        export const builder = Tagged.builder('inAppNotification' as const, Guid.builder);
    }

    /**
     * Union type representing the different events that can trigger an in-app notification.
     */
    export type Event =
        | { type: 'fine-added'; teamId: Team.Id; fineId: Fine.Id; reason: string; }
        | { type: 'fine-updated'; teamId: Team.Id; fineId: Fine.Id; reason: string; }
        | { type: 'fine-payed'; teamId: Team.Id; fineId: Fine.Id; reason: string; }
        | { type: 'fine-deleted'; teamId: Team.Id; reason: string; }
        | { type: 'person-role-changed'; teamId: Team.Id; }
        | { type: 'team-kickout'; teamId: Team.Id; };

    export namespace Event {

        /**
         * Flattened representation of an Event for serialization.
         */
        export type Flatten =
            | { type: 'fine-added'; teamId: Team.Id.Flatten; fineId: Fine.Id.Flatten; reason: string; }
            | { type: 'fine-updated'; teamId: Team.Id.Flatten; fineId: Fine.Id.Flatten; reason: string; }
            | { type: 'fine-payed'; teamId: Team.Id.Flatten; fineId: Fine.Id.Flatten; reason: string; }
            | { type: 'fine-deleted'; teamId: Team.Id.Flatten; reason: string; }
            | { type: 'person-role-changed'; teamId: Team.Id.Flatten; }
            | { type: 'team-kickout'; teamId: Team.Id.Flatten; };

        /**
         * Flattens an Event instance for serialization.
         *
         * @param event - The event to flatten
         * @returns The flattened event representation
         */
        export function flatten(event: Event): Flatten {
            switch (event.type) {
            case 'fine-added':
            case 'fine-updated':
            case 'fine-payed':
                return { type: event.type, teamId: event.teamId.flatten, fineId: event.fineId.flatten, reason: event.reason };
            case 'fine-deleted':
                return { type: event.type, teamId: event.teamId.flatten, reason: event.reason };
            case 'person-role-changed':
            case 'team-kickout':
                return { type: event.type, teamId: event.teamId.flatten };
            }
        }

        /**
         * Type builder for Event serialization/deserialization.
         */
        export class TypeBuilder implements ITypeBuilder<Flatten, Event> {

            /**
             * Builds an Event instance from flattened data.
             *
             * @param value - The flattened event data
             * @returns The appropriate Event instance based on the type discriminator
             */
            public build(value: Flatten): Event {
                switch (value.type) {
                case 'fine-added':
                case 'fine-updated':
                case 'fine-payed':
                    return {
                        type: value.type,
                        teamId: Team.Id.builder.build(value.teamId),
                        fineId: Fine.Id.builder.build(value.fineId),
                        reason: value.reason
                    };
                case 'fine-deleted':
                    return {
                        type: value.type,
                        teamId: Team.Id.builder.build(value.teamId),
                        reason: value.reason
                    };
                case 'person-role-changed':
                case 'team-kickout':
                    return {
                        type: value.type,
                        teamId: Team.Id.builder.build(value.teamId)
                    };
                }
            }
        }

        /**
         * Singleton builder instance for Event.
         */
        export const builder = new TypeBuilder();
    }

    /**
     * Flattened representation of an InAppNotification for serialization.
     */
    export type Flatten = {
        id: Id.Flatten;
        date: UtcDate.Flatten;
        isRead: boolean;
        event: Event.Flatten;
    };

    /**
     * Type builder for InAppNotification serialization/deserialization.
     */
    export class TypeBuilder implements ITypeBuilder<Flatten, InAppNotification> {

        /**
         * Builds an InAppNotification instance from flattened data.
         *
         * @param value - The flattened notification data
         * @returns A new InAppNotification instance
         */
        public build(value: Flatten): InAppNotification {
            return new InAppNotification(
                Id.builder.build(value.id),
                UtcDate.builder.build(value.date),
                value.isRead,
                Event.builder.build(value.event)
            );
        }
    }

    /**
     * Singleton builder instance for InAppNotification.
     */
    export const builder = new TypeBuilder();
}
