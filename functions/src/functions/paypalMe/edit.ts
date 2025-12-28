import { FunctionsError } from '@stevenkellner/firebase-function';
import { PaypalMeEditFunctionBase, PaypalMeEditFunctionParameters, checkAuthentication, Team, Firestore } from '@stevenkellner/team-conduct-api';

export class PaypalMeEditFunction extends PaypalMeEditFunctionBase {

    public async execute(parameters: PaypalMeEditFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'team-manager');

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        team.paypalMeLink = parameters.paypalMeLink;
        await Firestore.shared.team(parameters.teamId).set(team);
    }
}
