import * as functions from 'firebase-functions';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { Team, TeamId } from '../types/Team';

export type Parameters = {
    teamId: TeamId;
    paypalMeLink: string | null;
};

export class PaypalMeEditFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        paypalMeLink: new ValueTypeBuilder()
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('PaypalMeEditFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('PaypalMeEditFunction.execute');

        await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'team-manager');

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data, this.logger.nextIndent);

        team.paypalMeLink = parameters.paypalMeLink;
        await Firestore.shared.team(parameters.teamId).set(team);
    }
}
