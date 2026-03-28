import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { User } from '@stevenkellner/team-conduct-api';
import { RandomData } from '../../utils/RandomData';

describe('UserLoginFunction', () => {

    let userAuthId: UserAuthId;
    const userId = RandomData.shared.userId();

    beforeEach(async () => {
        userAuthId = await FirebaseApp.shared.addTestTeam([], userId);
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('not signed in', async () => {
        await FirebaseApp.shared.auth.signOut();
        const result = await FirebaseApp.shared.functions.user.login.executeWithResult(null);
        expect(result).toBeEqual(Result.failure(new FunctionsError('unauthenticated', 'User is not authenticated.')));
    });

    it('user auth not found', async () => {
        await FirebaseApp.shared.firestore.userAuth(userAuthId).remove();
        await FirebaseApp.shared.firestore.user(userId).remove();
        const result = await FirebaseApp.shared.functions.user.login.executeWithResult(null);
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User authentication record not found.')));
    });

    it('user not found', async () => {
        await FirebaseApp.shared.firestore.user(userId).remove();
        const result = await FirebaseApp.shared.functions.user.login.executeWithResult(null);
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User not found.')));
    });

    it('login', async () => {
        const user = await FirebaseApp.shared.functions.user.login.execute(null);
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(user).toBeEqual(User.builder.build(userSnapshot.data));
    });
});
