import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Configuration, Fine, Person, Team } from '../../types';

export type FineAddFunctionParameters = {
    teamId: Team.Id,
    personId: Person.Id,
    fine: Fine,
    configuration: Configuration
};

export abstract class FineAddFunctionBase extends FirebaseFunction<FineAddFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineAddFunctionParameters>, FineAddFunctionParameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        fine: Fine.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
