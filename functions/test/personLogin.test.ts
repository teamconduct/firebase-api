import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';

describe('UserLoginFunction', () => {

    let userId: string;

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
        try {
            await FirebaseApp.shared.auth.createUser('abc.def@ghi.jkl', 'password');
        } catch {
            await FirebaseApp.shared.auth.signIn('abc.def@ghi.jkl', 'password');
        }
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('login').callFunction(null);
        await expect(execute).to.awaitThrow('not-found');
    });

    it('login', async () => {
        const user = await FirebaseApp.shared.functions.function('user').function('login').callFunction(null);
        const userSnapshot = await FirebaseApp.shared.firestore.getSubCollection('users').getDocument(userId).snapshot();
        expect(user).to.be.deep.equal(userSnapshot.data);
    });
});
