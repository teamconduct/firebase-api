import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Firestore, User, UserRegisterFunction } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

export class UserRegisterExecutableFunction extends UserRegisterFunction implements ExecutableFirebaseFunction<UserRegisterFunction.Parameters, User> {

    public async execute(userAuthId: UserAuthId | null, parameters: UserRegisterFunction.Parameters): Promise<User> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated.');

        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (userAuthSnapshot.exists)
            throw new FunctionsError('already-exists', 'User is already registered.');

        const userSnapshot = await Firestore.shared.user(parameters.userId).snapshot();
        if (userSnapshot.exists)
            throw new FunctionsError('already-exists', 'User is already registered.');

        const batch = Firestore.shared.batch();
        batch.set(Firestore.shared.userAuth(userAuthId), parameters.userId);
        batch.set(Firestore.shared.user(parameters.userId), new User(parameters.userId, UtcDate.now, parameters.signInType));
        await batch.commit();

        return User.builder.build(userSnapshot.data);
    }
}
