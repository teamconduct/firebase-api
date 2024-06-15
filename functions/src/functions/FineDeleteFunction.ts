import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';
import { Amount } from '../types';

export type Parameters = {
    teamId: Guid,
    id: Guid,
    personId: Guid
}

export class FineDeleteFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        id: new TypeBuilder(Guid.from),
        personId: new TypeBuilder(Guid.from)
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineDeleteFunction.constructor', null, 'notice');
    }

    private async existsTeam(id: Guid): Promise<boolean> {
        const teamDocument = firestoreBase.getSubCollection('teams').getDocument(id.guidString);
        const teamSnapshot = await teamDocument.snapshot();
        return teamSnapshot.exists;
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineDeleteFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fine-delete');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');

        const fineSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('fines').getDocument(parameters.id.guidString).snapshot();
        if (!fineSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Fine not found');

        const personSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('fines').removeDocument(parameters.id.guidString);

        const fineIds = personSnapshot.data.fineIds.filter(id => id !== parameters.id.guidString).map(Guid.from);
        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).setValues({
            fineIds: fineIds
        });

        await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
            title: i18n.__('notification.fine-state-change.title'),
            body: i18n.__('notification.fine-state-change.body-deleted', fineSnapshot.data.reason, Amount.builder.build(fineSnapshot.data.amount).completeValue as unknown as string)
        }, this.logger.nextIndent);
    }
}
