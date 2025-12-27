import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type PersonAddFunctionParameters = {
    teamId: Team.Id
    id: Person.Id,
    properties: PersonPrivateProperties
};

export abstract class PersonAddFunctionBase extends FirebaseFunction<PersonAddFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonAddFunctionParameters>, PersonAddFunctionParameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder,
        properties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
