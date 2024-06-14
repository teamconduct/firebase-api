import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { checkAuthentication } from '../checkAuthentication';
import { firestoreBase } from '../firestoreBase';

export type Parameters = {
    teamId: Guid;
    paypalMeLink: string | null;
};

export class PaypalMeEditFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        paypalMeLink: new ValueTypeBuilder()
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('PaypalMeEditFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('PaypalMeEditFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'team-properties-manager');

        const teamSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).snapshot();
        if (!teamSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Team not found');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).setValues({
            paypalMeLink: parameters.paypalMeLink
        });
    }
}
