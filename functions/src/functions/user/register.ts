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

        await Firestore.shared.userAuth(userAuthId).set(parameters.userId);

        const user = new User(parameters.userId, UtcDate.now, parameters.signInType);
        user.teams.set(parameters.id, new User.TeamProperties(parameters.id, parameters.name, parameters.personId));
        await Firestore.shared.user(userId).set(user);

        return User.builder.build(userSnapshot.data);
    }
}
