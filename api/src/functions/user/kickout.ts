import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team, User } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace UserKickoutFunction {

    export type Parameters = {
        teamId: Team.Id
        userId: User.Id
    };
}
export class UserKickoutFunction implements FirebaseFunction<UserKickoutFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserKickoutFunction.Parameters>, UserKickoutFunction.Parameters>({
        teamId: Team.Id.builder,
        userId: User.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
