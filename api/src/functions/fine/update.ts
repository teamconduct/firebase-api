import { Configuration } from '../../types/Configuration';
import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { pushNotification } from '../../firebase/pushNotification';
import { Fine, Localization, Person, Team, ValueLocalization } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { checkAuthentication } from '../../firebase/checkAuthentication';
import { Firestore } from '../../firebase/Firestore';

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

        const localization = Localization.shared(parameters.configuration.locale);
        if (parameters.fine.payedState !== fineSnapshot.data.payedState) {
            let bodyLocalization: ValueLocalization;
            if (parameters.fine.payedState === 'payed')
                bodyLocalization = localization.notification.fine.stateChange.bodyPayed;
            else
                bodyLocalization = localization.notification.fine.stateChange.bodyUnpayed;
            await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
                title: localization.notification.fine.stateChange.title.value(),
                body: bodyLocalization.value({
                    reason: parameters.fine.reason,
                    amount: parameters.fine.amount.formatted(parameters.configuration)
                })
            });

        }
    }
}
