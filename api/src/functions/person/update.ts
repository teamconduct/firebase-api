import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace PersonUpdateFunction {

    export type Parameters = {
        teamId: Team.Id,
        id: Person.Id,
        properties: PersonPrivateProperties
    };
}

export class PersonUpdateFunction implements FirebaseFunction<PersonUpdateFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonUpdateFunction.Parameters>, PersonUpdateFunction.Parameters>({
        teamId: Team.Id.builder,
        id: Person.Id.builder,
        properties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
