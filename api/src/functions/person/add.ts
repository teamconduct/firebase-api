import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace PersonAddFunction {

    export type Parameters = {
        teamId: Team.Id
        id: Person.Id,
        properties: PersonPrivateProperties
    };
}

export class PersonAddFunction implements FirebaseFunction<PersonAddFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonAddFunction.Parameters>, PersonAddFunction.Parameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder,
        properties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
