import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Firestore, User, UserLoginFunction } from '@stevenkellner/team-conduct-api';

export class UserLoginExecutableFunction extends UserLoginFunction implements ExecutableFirebaseFunction<null, User> {

    public async execute(userAuthId: UserAuthId | null): Promise<User> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated.');

        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (!userAuthSnapshot.exists)
            throw new FunctionsError('not-found', 'User authentication record not found.');
        const userId = User.Id.builder.build(userAuthSnapshot.data);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');

        return User.builder.build(userSnapshot.data);
    }
}
