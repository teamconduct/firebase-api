import * as functions from 'firebase-functions';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { FineTemplate } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type Parameters = {
    teamId: TeamId,
    fineTemplate: FineTemplate
};

export class FineTemplateUpdateFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        fineTemplate: FineTemplate.builder
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineTemplateUpdateFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineTemplateUpdateFunction.execute');

        await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
