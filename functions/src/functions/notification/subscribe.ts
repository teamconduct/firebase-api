import {  ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Firestore, NotificationSubscribeFunction, Person } from '@stevenkellner/team-conduct-api';

export class NotificationSubscribeExecutableFunction extends NotificationSubscribeFunction implements ExecutableFirebaseFunction<NotificationSubscribeFunction.Parameters, void> {

    public async execute(_: string | null,parameters: NotificationSubscribeFunction.Parameters): Promise<void> {

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
