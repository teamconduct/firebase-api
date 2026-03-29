import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace PersonKickoutFunction {

    export type Parameters = {
        teamId: Team.Id
        personId: Person.Id
    };
}
export class PersonKickoutFunction implements FirebaseFunction<PersonKickoutFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonKickoutFunction.Parameters>, PersonKickoutFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
