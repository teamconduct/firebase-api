import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team, User } from '../../types';
import { Flattable, ObjectTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type InvitationRegisterFunctionParameters = {
    teamId: Team.Id
    personId: Person.Id
};

export abstract class InvitationRegisterFunctionBase extends FirebaseFunction<InvitationRegisterFunctionParameters, User> {

    public parametersBuilder =  new ObjectTypeBuilder<Flattable.Flatten<InvitationRegisterFunctionParameters>, InvitationRegisterFunctionParameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder
    });

    public returnTypeBuilder = User.builder;
}
