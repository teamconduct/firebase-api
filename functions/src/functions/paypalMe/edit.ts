import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function/admin";
import { Team } from "../../types";
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';

export namespace PaypalMeEditFunction {

    export type Parameters = {
        teamId: Team.Id;
        paypalMeLink: string | null;
    };
}

export class PaypalMeEditFunction extends FirebaseFunction<PaypalMeEditFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PaypalMeEditFunction.Parameters>, PaypalMeEditFunction.Parameters>({
        teamId: Team.Id.builder,
        paypalMeLink: new ValueTypeBuilder()
    });

    public constructor() {
        super('PaypalMeEditFunction');
    }

    public async execute(parameters: PaypalMeEditFunction.Parameters): Promise<void> {
        this.logger.log('PaypalMeEditFunction.execute');

        await checkAuthentication(this.userId, parameters.teamId, 'team-manager');

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        team.paypalMeLink = parameters.paypalMeLink;
        await Firestore.shared.team(parameters.teamId).set(team);
    }
}
