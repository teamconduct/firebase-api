import * as functions from 'firebase-functions';
import { FirebaseFunction, ILogger, ObjectTypeBuilder, ValueTypeBuilder, Flatten, AuthUser } from 'firebase-function';
import { Person, PersonId } from '../types';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';
import { TokenId } from '../types/PersonNotificationProperties';

export type Parameters = {
    teamId: TeamId,
    personId: PersonId,
    token: string
}

export class NotificationRegisterFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        personId: PersonId.builder,
        token: new ValueTypeBuilder()
    });

    public constructor(
        _authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('NotificationRegisterFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('NotificationRegisterFunction.execute');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        if (person.signInProperties === null)
            throw new functions.https.HttpsError('failed-precondition', 'Person not signed in');

        person.signInProperties.notificationProperties.tokens.set(TokenId.create(parameters.token), parameters.token);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
