import { FunctionsError } from '@stevenkellner/firebase-function';
import { Firestore, User, UserLoginFunctionBase } from '@stevenkellner/team-conduct-api';

export class UserLoginFunction extends UserLoginFunctionBase {

    public async execute(): Promise<User> {

        if (this.userId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated.');
        const userId = User.Id.builder.build(this.userId);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');

        return User.builder.build(userSnapshot.data);
    }
}
