import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Configuration, Fine, Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type FineDeleteFunctionParameters = {
    teamId: Team.Id,
    personId: Person.Id,
    id: Fine.Id,
    configuration: Configuration
}

export abstract class FineDeleteFunctionBase extends FirebaseFunction<FineDeleteFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineDeleteFunctionParameters>, FineDeleteFunctionParameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        id: Fine.Id.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
