import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { User } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace UserLoginAfter2FAFunction {

    export type Parameters = {
        totpToken: string
    };
}

export class UserLoginAfter2FAFunction implements FirebaseFunction<UserLoginAfter2FAFunction.Parameters, User> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserLoginAfter2FAFunction.Parameters>, UserLoginAfter2FAFunction.Parameters>({
        totpToken: new ValueTypeBuilder<string>()
    });

    public returnTypeBuilder = User.builder;
}
