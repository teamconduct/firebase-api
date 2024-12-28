import * as functions from 'firebase-functions';
import * as i18n from 'i18n';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { Fine, PersonId } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';
import { FineValue } from '../types/FineValue';

export type Parameters = {
    teamId: TeamId,
    personId: PersonId,
    fine: Fine
};

export class FineUpdateFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        personId: PersonId.builder,
        fine: Fine.builder
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineUpdateFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineUpdateFunction.execute');

        await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'fine-manager');

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.fine.id).snapshot();
        if (!fineSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Fine not found');

        await Firestore.shared.fine(parameters.teamId, parameters.fine.id).set(parameters.fine);

        if (parameters.fine.payedState !== fineSnapshot.data.payedState) {
            let body: string;
            if (parameters.fine.payedState === 'payed')
                body = i18n.__('notification.fine-state-change.body-payed', FineValue.format(parameters.fine.value), parameters.fine.reason);
            else
                body = i18n.__('notification.fine-state-change.body-unpayed', parameters.fine.reason, FineValue.format(parameters.fine.value));
            await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
                title: i18n.__('notification.fine-state-change.title'),
                body: body
            }, this.logger.nextIndent);

        }
    }
}
