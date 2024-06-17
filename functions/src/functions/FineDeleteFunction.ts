import * as functions from 'firebase-functions';
import * as i18n from 'i18n';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';
import { Amount, Person } from '../types';
import { Firestore } from '../Firestore';

export type Parameters = {
    teamId: Guid,
    personId: Guid,
    id: Guid
}

export class FineDeleteFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        personId: new TypeBuilder(Guid.from),
        id: new TypeBuilder(Guid.from)
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineDeleteFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineDeleteFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fine-delete');

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
            body: i18n.__('notification.fine-state-change.body-deleted', fineSnapshot.data.reason, Amount.builder.build(fineSnapshot.data.amount).completeValue as unknown as string)
        }, this.logger.nextIndent);
    }
}
