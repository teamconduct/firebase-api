import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team, UserRole } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type UserRoleEditFunctionParameters = {
    teamId: Team.Id
    personId: Person.Id
    roles: UserRole[]
};

export abstract class UserRoleEditFunctionBase extends FirebaseFunction<UserRoleEditFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserRoleEditFunctionParameters>, UserRoleEditFunctionParameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
