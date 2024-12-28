import * as functions from 'firebase-functions';
import * as i18n from 'i18n';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';
import { FineId, Person, PersonId } from '../types';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';
import { FineValue } from '../types/FineValue';

export type Parameters = {
    teamId: TeamId,
    personId: PersonId,
    id: FineId
}

export class FineDeleteFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        personId: PersonId.builder,
        id: FineId.builder
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineDeleteFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineDeleteFunction.execute');

        await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'fine-manager');

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.id).snapshot();
        if (!fineSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Fine not found');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        await Firestore.shared.fine(parameters.teamId, parameters.id).remove();

        person.fineIds = person.fineIds.filter(id => id.guidString !== parameters.id.guidString);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);

        await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
            title: i18n.__('notification.fine-state-change.title'),
            body: i18n.__('notification.fine-state-change.body-deleted', fineSnapshot.data.reason, FineValue.format(FineValue.builder.build(fineSnapshot.data.value, this.logger.nextIndent)))
        }, this.logger.nextIndent);
    }
}
