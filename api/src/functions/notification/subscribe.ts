import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { NotificationProperties, Person, Team } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace NotificationSubscribeFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        subscriptions: NotificationProperties.Subscription[]
    };
}

export class NotificationSubscribeFunction implements FirebaseFunction<NotificationSubscribeFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<NotificationSubscribeFunction.Parameters>, NotificationSubscribeFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
