import { Configuration } from './../../types/Configuration';
import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { pushNotification } from '../../pushNotification';
import { Fine, Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';
import * as i18n from 'i18n';

export namespace FineUpdateFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        fine: Fine,
        configuration: Configuration
    };
}

export class FineUpdateFunction extends FirebaseFunction<FineUpdateFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineUpdateFunction.Parameters>, FineUpdateFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        fine: Fine.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: FineUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fine-manager');

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.fine.id).snapshot();
        if (!fineSnapshot.exists)
            throw new FunctionsError('not-found', 'Fine not found');

        await Firestore.shared.fine(parameters.teamId, parameters.fine.id).set(parameters.fine);

        i18n.setLocale(parameters.configuration.locale);
        if (parameters.fine.payedState !== fineSnapshot.data.payedState) {
            let body: string;
            if (parameters.fine.payedState === 'payed')
                body = i18n.__('notification.fine.state-change.body-payed', parameters.fine.amount.formatted(parameters.configuration), parameters.fine.reason);
            else
                body = i18n.__('notification.fine.state-change.body-unpayed', parameters.fine.reason, parameters.fine.amount.formatted(parameters.configuration));
            await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
                title: i18n.__('notification.fine.state-change.title'),
                body: body
            });

        }
    }
}
