import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { NotificationProperties, Person, Team } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type NotificationSubscribeFunctionParameters = {
    teamId: Team.Id,
    personId: Person.Id,
    subscriptions: NotificationProperties.Subscription[]
};

export abstract class NotificationSubscribeFunctionBase extends FirebaseFunction<NotificationSubscribeFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<NotificationSubscribeFunctionParameters>, NotificationSubscribeFunctionParameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
