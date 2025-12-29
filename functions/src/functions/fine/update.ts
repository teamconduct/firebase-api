import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { FineUpdateFunction, checkAuthentication, Localization, ValueLocalization, pushNotification, Firestore } from '@stevenkellner/team-conduct-api';

export class FineUpdateExecutableFunction extends FineUpdateFunction implements ExecutableFirebaseFunction<FineUpdateFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, 'fine-manager');

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
