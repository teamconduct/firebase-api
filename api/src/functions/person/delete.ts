import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace PersonDeleteFunction {

    export type Parameters = {
        teamId: Team.Id,
        id: Person.Id
    };
}

export class PersonDeleteFunction implements FirebaseFunction<PersonDeleteFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonDeleteFunction.Parameters>, PersonDeleteFunction.Parameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
