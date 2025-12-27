import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type PersonDeleteFunctionParameters = {
    teamId: Team.Id,
    id: Person.Id
}

export abstract class PersonDeleteFunctionBase extends FirebaseFunction<PersonDeleteFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonDeleteFunctionParameters>, PersonDeleteFunctionParameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
