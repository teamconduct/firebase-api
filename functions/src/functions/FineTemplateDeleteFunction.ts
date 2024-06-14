import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';

export type Parameters = {
    teamId: Guid,
    id: Guid
}

export class FineTemplateDeleteFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        id: new TypeBuilder(Guid.from)
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineTemplateDeleteFunction.constructor', null, 'notice');
    }

    private async existsTeam(id: Guid): Promise<boolean> {
        const teamDocument = firestoreBase.getSubCollection('teams').getDocument(id.guidString);
        const teamSnapshot = await teamDocument.snapshot();
        return teamSnapshot.exists;
    }

    private async existsFineTemplate(teamId: Guid, id: Guid): Promise<boolean> {
        const fineTemplateDocument = firestoreBase.getSubCollection('teams').getDocument(teamId.guidString).getSubCollection('fineTemplates').getDocument(id.guidString);
        const fineTemplateSnapshot = await fineTemplateDocument.snapshot();
        return fineTemplateSnapshot.exists;
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineTemplateDeleteFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fineTemplate-delete');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');

        if (!await this.existsFineTemplate(parameters.teamId, parameters.id))
            throw new functions.https.HttpsError('not-found', 'FineTemplate not found');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('fineTemplates').removeDocument(parameters.id.guidString);
    }
}
