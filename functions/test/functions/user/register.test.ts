import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { User } from '@stevenkellner/team-conduct-api';
import { RandomData } from '../../utils/RandomData';

describe('UserRegisterFunction', () => {

    const userId = RandomData.shared.userId();

    beforeEach(async () => {
        await FirebaseApp.shared.auth.signIn();
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('not signed in', async () => {
        await FirebaseApp.shared.auth.signOut();
        const result = await FirebaseApp.shared.functions.user.register.executeWithResult({
            userId: userId,
            signInType: new User.SignInTypeOAuth('google')
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('unauthenticated', 'User is not authenticated.')));
    });

    it('user auth already exists', async () => {
        const userAuthId = await FirebaseApp.shared.auth.signIn();
        await FirebaseApp.shared.firestore.userAuth(userAuthId).set({ userId: userId });
        const result = await FirebaseApp.shared.functions.user.register.executeWithResult({
            userId: userId,
            signInType: new User.SignInTypeOAuth('google')
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'User is already registered.')));
    });

    it('user already exists', async () => {
        const user = new User(userId, RandomData.shared.date(), new User.SignInTypeOAuth('google'));
        await FirebaseApp.shared.firestore.user(userId).set(user);
        const result = await FirebaseApp.shared.functions.user.register.executeWithResult({
            userId: userId,
            signInType: new User.SignInTypeOAuth('google')
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'User is already registered.')));
    });

    it('register with OAuth', async () => {
        const userAuthId = await FirebaseApp.shared.auth.signIn();
        const registeredUser = await FirebaseApp.shared.functions.user.register.execute({
            userId: userId,
            signInType: new User.SignInTypeOAuth('google')
        });

        expect(registeredUser.id).toBeEqual(userId);
        expect(registeredUser.signInType).toBeEqual(new User.SignInTypeOAuth('google'));

        const userAuthSnapshot = await FirebaseApp.shared.firestore.userAuth(userAuthId).snapshot();
        expect(userAuthSnapshot.exists).toBeTrue();
        expect(User.Id.builder.build(userAuthSnapshot.data.userId)).toBeEqual(userId);

        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(userSnapshot.exists).toBeTrue();
        const storedUser = User.builder.build(userSnapshot.data);
        expect(storedUser.id).toBeEqual(userId);
        expect(storedUser.signInType).toBeEqual(new User.SignInTypeOAuth('google'));
    });

    it('register with email', async () => {
        const userAuthId = await FirebaseApp.shared.auth.signIn();
        const email = 'test@example.com';
        const registeredUser = await FirebaseApp.shared.functions.user.register.execute({
            userId: userId,
            signInType: new User.SignInTypeEmail(email)
        });

        expect(registeredUser.id).toBeEqual(userId);
        expect(registeredUser.signInType).toBeEqual(new User.SignInTypeEmail(email));

        const userAuthSnapshot = await FirebaseApp.shared.firestore.userAuth(userAuthId).snapshot();
        expect(userAuthSnapshot.exists).toBeTrue();
        expect(User.Id.builder.build(userAuthSnapshot.data.userId)).toBeEqual(userId);

        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(userSnapshot.exists).toBeTrue();
        const storedUser = User.builder.build(userSnapshot.data);
        expect(storedUser.id).toBeEqual(userId);
        expect(storedUser.signInType).toBeEqual(new User.SignInTypeEmail(email));
    });
});
