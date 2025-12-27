import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { User } from '../../types';
import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export abstract class UserLoginFunctionBase extends FirebaseFunction<null, User> {

    public parametersBuilder = new ValueTypeBuilder<null>();

    public returnTypeBuilder = User.builder;
}
