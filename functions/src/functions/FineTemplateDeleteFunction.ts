import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';
import { FineTemplateId } from '../types';

export type Parameters = {
    teamId: TeamId,
    id: FineTemplateId
}

export class FineTemplateDeleteFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        id: FineTemplateId.builder
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineTemplateDeleteFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineTemplateDeleteFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fineTemplate-delete');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).remove();
    }
}
