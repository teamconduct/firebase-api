import { NotificationSubscription } from './../types/PersonNotificationProperties';
import * as functions from 'firebase-functions';
import { FirebaseFunction, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder, Flatten, ArrayTypeBuilder } from 'firebase-function';
import { Person } from '../types';
import { Firestore } from '../Firestore';

export type Parameters = {
    teamId: Guid,
    personId: Guid,
    subscriptions: NotificationSubscription[]
}

export class NotificationSubscribeFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        personId: new TypeBuilder(Guid.from),
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public constructor(
        _userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('NotificationSubscribeFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('NotificationSubscribeFunction.execute');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        if (person.signInProperties === null)
            throw new functions.https.HttpsError('failed-precondition', 'Person not signed in');

        person.signInProperties.notificationProperties.subscriptions = parameters.subscriptions;
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
