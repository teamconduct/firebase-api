import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team, UserRole } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace UserRoleEditFunction {

    export type Parameters = {
        teamId: Team.Id
        personId: Person.Id
        roles: UserRole[]
    };
}

export class UserRoleEditFunction implements FirebaseFunction<UserRoleEditFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserRoleEditFunction.Parameters>, UserRoleEditFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
