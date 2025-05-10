import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { NotificationProperties, Person, Team } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Firestore } from '../../Firestore';

export namespace NotificationSubscribeFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        subscriptions: NotificationProperties.Subscription[]
    }
}

export class NotificationSubscribeFunction extends FirebaseFunction<NotificationSubscribeFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<NotificationSubscribeFunction.Parameters>, NotificationSubscribeFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: NotificationSubscribeFunction.Parameters): Promise<void> {

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties === null)
            throw new FunctionsError('unauthenticated', 'Person not signed in');

        person.signInProperties.notificationProperties.subscriptions = parameters.subscriptions;
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
