import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Firestore, User, UserLoginAfter2FAFunction } from '@stevenkellner/team-conduct-api';
// eslint-disable-next-line import/namespace
import { TotpGenerator } from 'totp-native';

export class UserLoginAfter2FAExecutableFunction extends UserLoginAfter2FAFunction implements ExecutableFirebaseFunction<UserLoginAfter2FAFunction.Parameters, User> {

    public async execute(userAuthId: UserAuthId | null, parameters: UserLoginAfter2FAFunction.Parameters): Promise<User> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated.');

        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (!userAuthSnapshot.exists)
            throw new FunctionsError('not-found', 'User authentication record not found.');
        const userId = User.Id.builder.build(userAuthSnapshot.data.userId);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');
        const user = User.builder.build(userSnapshot.data);

        const userSecretsSnapshot = await Firestore.shared.userSecrets(userId).snapshot();
        if (!userSecretsSnapshot.exists)
            throw new FunctionsError('not-found', 'User secrets not found.');
        const totpSecret = userSecretsSnapshot.data.totpSecret;

        if (!user.settings.twoFactorAuthEnabled || totpSecret === null)
            throw new FunctionsError('failed-precondition', 'User does not have 2FA enabled.');

        const totp = new TotpGenerator({
            secret: totpSecret,
            digits: 6,
            algorithm: 'SHA512'
        });
        if (!(await totp.verify(parameters.totpToken)))
            throw new FunctionsError('invalid-argument', 'Invalid 2FA code.');

        return user;
    }
}
