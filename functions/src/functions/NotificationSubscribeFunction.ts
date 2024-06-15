import { NotificationSubscription } from './../types/PersonNotificationProperties';
import * as functions from 'firebase-functions';
import { FirebaseFunction, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder, Flatten, ArrayTypeBuilder } from 'firebase-function';
import { firestoreBase } from '../firestoreBase';
import { PersonSignInProperties } from '../types';

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

        const teamSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).snapshot();
        if (!teamSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Team not found');

        const personSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');

        const person = personSnapshot.data;
        if (person.signInProperties === null)
            throw new functions.https.HttpsError('failed-precondition', 'Person not signed in');

        person.signInProperties.notificationProperties.subscriptions = parameters.subscriptions;
        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).setValues({
            signInProperties: PersonSignInProperties.builder.build(person.signInProperties, this.logger.nextIndent)
        });
    }
}
