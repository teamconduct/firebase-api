import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { User } from '@stevenkellner/team-conduct-api';

describe('UserLoginFunction', () => {

    let userId: User.Id;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam();
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('not signed in', async () => {
        await FirebaseApp.shared.auth.signOut();
        const result = await FirebaseApp.shared.functions.user.login.executeWithResult(null);
        expect(result).toBeEqual(Result.failure(new FunctionsError('unauthenticated', 'User is not authenticated.')));
    });

    it('user not found', async () => {
        await FirebaseApp.shared.auth.signOut();
        await FirebaseApp.shared.auth.signIn('abc.def@ghi.jkl', 'password');
        const result = await FirebaseApp.shared.functions.user.login.executeWithResult(null);
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User not found.')));
    });

    it('login', async () => {
        const user = await FirebaseApp.shared.functions.user.login.execute(null);
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(user).toBeEqual(User.builder.build(userSnapshot.data));
    });
});
