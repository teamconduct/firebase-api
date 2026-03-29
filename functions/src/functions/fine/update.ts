import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { FineUpdateFunction, Localization, Team, ValueLocalization } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore, pushNotification } from '../../firebase';

export class FineUpdateExecutableFunction extends FineUpdateFunction implements ExecutableFirebaseFunction<FineUpdateFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, { anyOf: ['team-manager', 'fine-manager'] });

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const teamSettings = Team.builder.build(teamSnapshot.data).settings;

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.fine.id).snapshot();
        if (!fineSnapshot.exists)
            throw new FunctionsError('not-found', 'Fine not found');

        await Firestore.shared.fine(parameters.teamId, parameters.fine.id).set(parameters.fine);

        const localization = Localization.shared(teamSettings.locale);
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
                    amount: parameters.fine.amount.formatted(teamSettings.currency, teamSettings.locale)
                })
            });

        }
    }
}
