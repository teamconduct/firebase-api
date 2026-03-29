import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team, TeamRole } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace PersonRoleEditFunction {

    export type Parameters = {
        teamId: Team.Id
        personId: Person.Id
        roles: TeamRole[]
    };
}

export class PersonRoleEditFunction implements FirebaseFunction<PersonRoleEditFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<PersonRoleEditFunction.Parameters>, PersonRoleEditFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
