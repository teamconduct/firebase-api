import {  FunctionsError } from '@stevenkellner/firebase-function';
import { Firestore, NotificationSubscribeFunctionBase, NotificationSubscribeFunctionParameters, Person } from '@stevenkellner/team-conduct-api';

export class NotificationSubscribeFunction extends NotificationSubscribeFunctionBase {

    public async execute(parameters: NotificationSubscribeFunctionParameters): Promise<void> {

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
