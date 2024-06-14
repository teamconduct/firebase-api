import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, OptionalTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { Amount, FineTemplate, FineTemplateMultiple } from '../types';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';

export type Parameters = {
    teamId: Guid
} & FineTemplate;

export class FineTemplateAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        id: new TypeBuilder(Guid.from),
        reason: new ValueTypeBuilder(),
        amount: Amount.builder,
        multiple: new OptionalTypeBuilder(FineTemplateMultiple.builder)
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineTemplateAddFunction.constructor', null, 'notice');
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
        this.logger.log('FineTemplateAddFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fineTemplate-add');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');

        if (await this.existsFineTemplate(parameters.teamId, parameters.id))
            throw new functions.https.HttpsError('already-exists', 'FineTemplate already exists');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('fineTemplates').addDocument(parameters.id.guidString, {
            id: parameters.id,
            reason: parameters.reason,
            amount: parameters.amount,
            multiple: parameters.multiple
        });
    }
}
