import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { User } from '@stevenkellner/team-conduct-api';
import { RandomData } from '../../utils/RandomData';
import { TotpGenerator } from 'totp-native';

describe('UserLoginAfter2FAFunction', () => {

    let userAuthId: UserAuthId;
    const userId = RandomData.shared.userId();
    const totpSecret = TotpGenerator.generateSecret();

    beforeEach(async () => {
        userAuthId = await FirebaseApp.shared.addTestTeam([], userId);
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        const user = User.builder.build(userSnapshot.data);
        user.settings.twoFactorAuthEnabled = true;
        await FirebaseApp.shared.firestore.user(userId).set(user);
        await FirebaseApp.shared.firestore.userSecrets(userId).set({ totpSecret: totpSecret });
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('not signed in', async () => {
        await FirebaseApp.shared.auth.signOut();
        const result = await FirebaseApp.shared.functions.user.loginAfter2FA.executeWithResult({ totpToken: '000000' });
        expect(result).toBeEqual(Result.failure(new FunctionsError('unauthenticated', 'User is not authenticated.')));
    });

    it('user auth not found', async () => {
        await FirebaseApp.shared.firestore.userAuth(userAuthId).remove();
        const result = await FirebaseApp.shared.functions.user.loginAfter2FA.executeWithResult({ totpToken: '000000' });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User authentication record not found.')));
    });

    it('user not found', async () => {
        await FirebaseApp.shared.firestore.user(userId).remove();
        const result = await FirebaseApp.shared.functions.user.loginAfter2FA.executeWithResult({ totpToken: '000000' });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User not found.')));
    });

    it('user secrets not found', async () => {
        await FirebaseApp.shared.firestore.userSecrets(userId).remove();
        const result = await FirebaseApp.shared.functions.user.loginAfter2FA.executeWithResult({ totpToken: '000000' });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User secrets not found.')));
    });

    it('2FA not enabled', async () => {
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        const user = User.builder.build(userSnapshot.data);
        user.settings.twoFactorAuthEnabled = false;
        await FirebaseApp.shared.firestore.user(userId).set(user);
        const result = await FirebaseApp.shared.functions.user.loginAfter2FA.executeWithResult({ totpToken: '000000' });
        expect(result).toBeEqual(Result.failure(new FunctionsError('failed-precondition', 'User does not have 2FA enabled.')));
    });

    it('invalid TOTP token', async () => {
        const result = await FirebaseApp.shared.functions.user.loginAfter2FA.executeWithResult({ totpToken: '000000' });
        expect(result).toBeEqual(Result.failure(new FunctionsError('invalid-argument', 'Invalid 2FA code.')));
    });

    it('loginAfter2FA', async () => {
        const totp = new TotpGenerator({ secret: totpSecret, digits: 6, algorithm: 'SHA512' });
        const totpToken = await totp.generate();
        const user = await FirebaseApp.shared.functions.user.loginAfter2FA.execute({ totpToken: totpToken });
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(user).toBeEqual(User.builder.build(userSnapshot.data));
    });
});
