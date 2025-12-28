import { Configuration } from '../../types/Configuration';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Fine, Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace FineUpdateFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        fine: Fine,
        configuration: Configuration
    };
}

export class FineUpdateFunction implements FirebaseFunction<FineUpdateFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineUpdateFunction.Parameters>, FineUpdateFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        fine: Fine.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
