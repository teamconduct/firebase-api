import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team } from '../../types';

export type PaypalMeEditFunctionParameters = {
    teamId: Team.Id;
    paypalMeLink: string | null;
};

export abstract class PaypalMeEditFunctionBase extends FirebaseFunction<PaypalMeEditFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PaypalMeEditFunctionParameters>, PaypalMeEditFunctionParameters>({
        teamId: Team.Id.builder,
        paypalMeLink: new ValueTypeBuilder()
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
