import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { User } from '../../types';
import { ValueTypeBuilder, TypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class UserLoginFunction implements FirebaseFunction<null, User | '2FA_REQUIRED'> {

    public parametersBuilder = new ValueTypeBuilder<null>();

    public returnTypeBuilder = new TypeBuilder<User.Flatten | '2FA_REQUIRED', User | '2FA_REQUIRED'>(value => {
        if (value === '2FA_REQUIRED')
            return '2FA_REQUIRED';
        return User.builder.build(value);
    });
}
