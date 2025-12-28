import { FunctionsError } from '@stevenkellner/firebase-function';
import { Firestore, NotificationProperties, NotificationRegisterFunctionBase, NotificationRegisterFunctionParameters, Person } from '@stevenkellner/team-conduct-api';

export class NotificationRegisterFunction extends NotificationRegisterFunctionBase {

    public async execute(parameters: NotificationRegisterFunctionParameters): Promise<void> {

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties === null)
            throw new FunctionsError('unauthenticated', 'Person not signed in');

        person.signInProperties.notificationProperties.tokens.set(NotificationProperties.TokenId.create(parameters.token), parameters.token);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
