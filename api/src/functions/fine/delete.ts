import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Team, Person, Fine } from '../../types';

export namespace FineDeleteFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        id: Fine.Id
    }
}

export class FineDeleteFunction implements FirebaseFunction<FineDeleteFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineDeleteFunction.Parameters>, FineDeleteFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        id: Fine.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
