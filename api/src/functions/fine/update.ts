import { Configuration } from '../../types/Configuration';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Fine, Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type FineUpdateFunctionParameters = {
    teamId: Team.Id,
    personId: Person.Id,
    fine: Fine,
    configuration: Configuration
};

export abstract class FineUpdateFunctionBase extends FirebaseFunction<FineUpdateFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineUpdateFunctionParameters>, FineUpdateFunctionParameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        fine: Fine.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
