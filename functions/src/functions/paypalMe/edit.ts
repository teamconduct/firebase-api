import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { PaypalMeEditFunction, checkAuthentication, Team, Firestore } from '@stevenkellner/team-conduct-api';

export class PaypalMeEditExecutableFunction extends PaypalMeEditFunction implements ExecutableFirebaseFunction<PaypalMeEditFunction.Parameters, void> {

    public async execute(userId: string | null, parameters: PaypalMeEditFunction.Parameters): Promise<void> {

        await checkAuthentication(userId, parameters.teamId, 'team-manager');

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        team.paypalMeLink = parameters.paypalMeLink;
        await Firestore.shared.team(parameters.teamId).set(team);
    }
}
