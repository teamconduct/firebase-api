import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team, TeamRole } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace TeamRoleEditFunction {

    export type Parameters = {
        teamId: Team.Id
        personId: Person.Id
        roles: TeamRole[]
    };
}

export class TeamRoleEditFunction implements FirebaseFunction<TeamRoleEditFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamRoleEditFunction.Parameters>, TeamRoleEditFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
