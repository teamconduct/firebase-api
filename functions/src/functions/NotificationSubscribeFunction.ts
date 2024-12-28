import { NotificationSubscription } from './../types/PersonNotificationProperties';
import * as functions from 'firebase-functions';
import { FirebaseFunction, ILogger, ObjectTypeBuilder, ValueTypeBuilder, Flatten, ArrayTypeBuilder, AuthUser } from 'firebase-function';
import { Person, PersonId } from '../types';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type Parameters = {
    teamId: TeamId,
    personId: PersonId,
    subscriptions: NotificationSubscription[]
}

export class NotificationSubscribeFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        personId: PersonId.builder,
        subscriptions: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public constructor(
        _authUser: AuthUser | null,
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
