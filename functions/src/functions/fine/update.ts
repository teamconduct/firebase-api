import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { FineUpdateFunction, Team, PayedState } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore, NotificationSender } from '../../firebase';

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

        const sender = NotificationSender.for(parameters.teamId, parameters.personId);
        if (parameters.fine.payedState.type !== fineSnapshot.data.payedState.type) {
            if (parameters.fine.payedState instanceof PayedState.Payed)
                await sender.finePayed(parameters.fine.id, parameters.fine.reason, parameters.fine.amount, teamSettings);
            else
                await sender.fineUnpayed(parameters.fine.id, parameters.fine.reason, parameters.fine.amount, teamSettings);
        } else
            await sender.fineChanged(parameters.fine.id, parameters.fine.reason, teamSettings);
    }
}
