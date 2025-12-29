import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { User } from '../../types';
import { Flattable, ObjectTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace UserRegisterFunction {

    export type Parameters = {
        userId: User.Id
    };
}

export class UserRegisterFunction implements FirebaseFunction<UserRegisterFunction.Parameters, User> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserRegisterFunction.Parameters>, UserRegisterFunction.Parameters>({
        userId: User.Id.builder
    });

    public returnTypeBuilder = User.builder;
}
