import { Flattable, Guid, ITypeBuilder, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { Fine } from './Fine';
import { Team } from './Team';

export class InAppNotification implements Flattable<InAppNotification.Flatten> {

    public constructor(
        public id: InAppNotification.Id,
        public date: UtcDate,
        public isRead: boolean,
        public event: InAppNotification.Event
    ) {}

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

    export type Id = Tagged<Guid, 'inAppNotification'>;

    export namespace Id {
        export type Flatten = string;
        export const builder = Tagged.builder('inAppNotification' as const, Guid.builder);
    }

    export type Event =
        | { type: 'fine-added'; teamId: Team.Id; fineId: Fine.Id; reason: string; }
        | { type: 'fine-updated'; teamId: Team.Id; fineId: Fine.Id; reason: string; }
        | { type: 'fine-payed'; teamId: Team.Id; fineId: Fine.Id; reason: string; }
        | { type: 'fine-deleted'; teamId: Team.Id; reason: string; }
        | { type: 'person-role-changed'; teamId: Team.Id; }
        | { type: 'team-kickout'; teamId: Team.Id; };

    export namespace Event {

        export type Flatten =
            | { type: 'fine-added'; teamId: Team.Id.Flatten; fineId: Fine.Id.Flatten; reason: string; }
            | { type: 'fine-updated'; teamId: Team.Id.Flatten; fineId: Fine.Id.Flatten; reason: string; }
            | { type: 'fine-payed'; teamId: Team.Id.Flatten; fineId: Fine.Id.Flatten; reason: string; }
            | { type: 'fine-deleted'; teamId: Team.Id.Flatten; reason: string; }
            | { type: 'person-role-changed'; teamId: Team.Id.Flatten; }
            | { type: 'team-kickout'; teamId: Team.Id.Flatten; };

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

        export class TypeBuilder implements ITypeBuilder<Flatten, Event> {
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

        export const builder = new TypeBuilder();
    }

    export type Flatten = {
        id: Id.Flatten;
        date: UtcDate.Flatten;
        isRead: boolean;
        event: Event.Flatten;
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, InAppNotification> {
        public build(value: Flatten): InAppNotification {
            return new InAppNotification(
                Id.builder.build(value.id),
                UtcDate.builder.build(value.date),
                value.isRead,
                Event.builder.build(value.event)
            );
        }
    }

    export const builder = new TypeBuilder();
}
