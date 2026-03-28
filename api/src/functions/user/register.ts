import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { User } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace UserRegisterFunction {

    export type Parameters = {
        userId: User.Id,
        signInType: User.SignInType,
        firstName: string,
        lastName: string
    };
}

export class UserRegisterFunction implements FirebaseFunction<UserRegisterFunction.Parameters, User> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserRegisterFunction.Parameters>, UserRegisterFunction.Parameters>({
        userId: User.Id.builder,
        signInType: User.SignInType.builder,
        firstName: new ValueTypeBuilder(),
        lastName: new ValueTypeBuilder()
    });

    public returnTypeBuilder = User.builder;
}
