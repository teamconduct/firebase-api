import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team, User } from '../../types';
import { Flattable, ObjectTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace InvitationRegisterFunction {

    export type Parameters = {
        teamId: Team.Id
        personId: Person.Id
        signInType: User.SignInType
    };
}

export class InvitationRegisterFunction implements FirebaseFunction<InvitationRegisterFunction.Parameters, User> {

    public parametersBuilder =  new ObjectTypeBuilder<Flattable.Flatten<InvitationRegisterFunction.Parameters>, InvitationRegisterFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        signInType: User.SignInType.builder
    });

    public returnTypeBuilder = User.builder;
}
