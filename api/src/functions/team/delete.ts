import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team } from '../../types';

export namespace TeamDeleteFunction {

    export type Parameters = {
        id: Team.Id
    };
}

export class TeamDeleteFunction implements FirebaseFunction<TeamDeleteFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamDeleteFunction.Parameters>, TeamDeleteFunction.Parameters>({
        id: Team.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
