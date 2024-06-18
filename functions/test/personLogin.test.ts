import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { UserId } from '../src/types';
import { Firestore } from '../src/Firestore';

describe('UserLoginFunction', () => {

    let userId: UserId;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam();
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('not signed in', async () => {
        await FirebaseApp.shared.auth.signOut();
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('login').callFunction(null);
        await expect(execute).to.awaitThrow('unauthenticated');
    });

    it('user not found', async () => {
        await FirebaseApp.shared.auth.signOut();
        await FirebaseApp.shared.auth.signIn('abc.def@ghi.jkl', 'password');
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('login').callFunction(null);
        await expect(execute).to.awaitThrow('not-found');
    });

    it('login', async () => {
        const user = await FirebaseApp.shared.functions.function('user').function('login').callFunction(null);
        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        expect(user).to.be.deep.equal(userSnapshot.data);
    });
});
