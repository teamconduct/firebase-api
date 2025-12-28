import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team } from '../../types';

export namespace PaypalMeEditFunction {

    export type Parameters = {
        teamId: Team.Id;
        paypalMeLink: string | null;
    };
}

export class PaypalMeEditFunction implements FirebaseFunction<PaypalMeEditFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PaypalMeEditFunction.Parameters>, PaypalMeEditFunction.Parameters>({
        teamId: Team.Id.builder,
        paypalMeLink: new ValueTypeBuilder()
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
