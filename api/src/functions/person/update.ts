import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type PersonUpdateFunctionParameters = {
    teamId: Team.Id,
    id: Person.Id,
    properties: PersonPrivateProperties
};

export abstract class PersonUpdateFunctionBase extends FirebaseFunction<PersonUpdateFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonUpdateFunctionParameters>, PersonUpdateFunctionParameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder,
        properties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
