import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Firestore, User, UserLoginFunction } from '@stevenkellner/team-conduct-api';

export class UserLoginExecutableFunction extends UserLoginFunction implements ExecutableFirebaseFunction<null, User> {

    public async execute(rawUserId: string | null): Promise<User> {

        if (rawUserId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated.');
        const userId = User.Id.builder.build(rawUserId);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');

        return User.builder.build(userSnapshot.data);
    }
}
