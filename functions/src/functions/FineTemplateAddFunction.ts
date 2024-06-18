import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { FineTemplate } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type Parameters = {
    teamId: TeamId,
    fineTemplate: FineTemplate
}

export class FineTemplateAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        fineTemplate: FineTemplate.builder
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineTemplateAddFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineTemplateAddFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fineTemplate-add');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (fineTemplateSnapshot.exists)
            throw new functions.https.HttpsError('already-exists', 'FineTemplate already exists');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
