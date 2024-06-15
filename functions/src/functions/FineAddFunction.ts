import * as functions from 'firebase-functions';
import * as i18n from 'i18n';
import { FirebaseFunction, Flatten, Guid, ILogger, IntersectionTypeBuilder, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { Fine } from '../types';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';

type ParametersSubsection = {
    teamId: Guid
    personId: Guid
}

export type Parameters = ParametersSubsection & Fine;

export class FineAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new IntersectionTypeBuilder(
        new ObjectTypeBuilder<Flatten<ParametersSubsection>, ParametersSubsection>({
            teamId: new TypeBuilder(Guid.from),
            personId: new TypeBuilder(Guid.from)
        }),
        Fine.builder
    );

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineAddFunction.constructor', null, 'notice');
    }

    private async existsTeam(id: Guid): Promise<boolean> {
        const teamDocument = firestoreBase.getSubCollection('teams').getDocument(id.guidString);
        const teamSnapshot = await teamDocument.snapshot();
        return teamSnapshot.exists;
    }

    private async existsFine(teamId: Guid, id: Guid): Promise<boolean> {
        const fineDocument = firestoreBase.getSubCollection('teams').getDocument(teamId.guidString).getSubCollection('fines').getDocument(id.guidString);
        const fineSnapshot = await fineDocument.snapshot();
        return fineSnapshot.exists;
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineAddFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fine-add');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');

        const personSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const fineIds = personSnapshot.data.fineIds.map(Guid.from);
        fineIds.push(parameters.id);
        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).setValues({
            fineIds: fineIds
        });

        if (await this.existsFine(parameters.teamId, parameters.id))
            throw new functions.https.HttpsError('already-exists', 'Fine already exists');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('fines').addDocument(parameters.id.guidString, {
            id: parameters.id,
            reason: parameters.reason,
            amount: parameters.amount,
            date: parameters.date,
            payedState: parameters.payedState
        });

        await pushNotification(parameters.teamId, parameters.personId, 'new-fine', {
            title: i18n.__('notification.new-fine.title', parameters.reason),
            body: i18n.__('notification.new-fine.body', parameters.amount.completeValue as unknown as string)
        }, this.logger.nextIndent);
    }
}
