import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Configuration, Fine, Person, Team } from '../../types';

export namespace FineAddFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        fine: Fine,
        configuration: Configuration
    };
}
export class FineAddFunction implements FirebaseFunction<FineAddFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineAddFunction.Parameters>, FineAddFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        fine: Fine.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
