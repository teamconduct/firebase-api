import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team, User } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type UserKickoutFunctionParameters = {
    teamId: Team.Id
    userId: User.Id
};

export abstract class UserKickoutFunctionBase extends FirebaseFunction<UserKickoutFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserKickoutFunctionParameters>, UserKickoutFunctionParameters>({
        teamId: Team.Id.builder,
        userId: User.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
