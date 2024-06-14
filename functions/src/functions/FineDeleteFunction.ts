import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';

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

    private async existsFine(teamId: Guid, id: Guid): Promise<boolean> {
        const fineDocument = firestoreBase.getSubCollection('teams').getDocument(teamId.guidString).getSubCollection('fines').getDocument(id.guidString);
        const fineSnapshot = await fineDocument.snapshot();
        return fineSnapshot.exists;
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineDeleteFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fine-delete');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');

        if (!await this.existsFine(parameters.teamId, parameters.id))
            throw new functions.https.HttpsError('not-found', 'Fine not found');

        const personSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('fines').removeDocument(parameters.id.guidString);

        const fineIds = personSnapshot.data.fineIds.filter(id => id !== parameters.id.guidString).map(Guid.from);
        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).setValues({
            fineIds: fineIds
        });
    }
}
