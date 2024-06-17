import * as functions from 'firebase-functions';
import * as i18n from 'i18n';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { Fine } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';
import { Firestore } from '../Firestore';

export type Parameters = {
    teamId: Guid,
    personId: Guid,
    fine: Fine
};


export class FineUpdateFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        personId: new TypeBuilder(Guid.from),
        fine: Fine.builder
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineUpdateFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineUpdateFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fine-update');

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.fine.id).snapshot();
        if (!fineSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Fine not found');

        await Firestore.shared.fine(parameters.teamId, parameters.fine.id).set(parameters.fine);

        if (parameters.fine.payedState !== fineSnapshot.data.payedState) {
            let body: string;
            if (parameters.fine.payedState === 'payed')
                body = i18n.__('notification.fine-state-change.body-payed', parameters.fine.amount.completeValue as unknown as string, parameters.fine.reason);
            else
                body = i18n.__('notification.fine-state-change.body-unpayed', parameters.fine.reason, parameters.fine.amount.completeValue as unknown as string);
            await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
                title: i18n.__('notification.fine-state-change.title'),
                body: body
            }, this.logger.nextIndent);

        }
    }
}
