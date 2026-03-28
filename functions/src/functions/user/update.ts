import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { User, UserUpdateFunction } from '@stevenkellner/team-conduct-api';
import { Firestore } from '../../firebase';

export class UserUpdateExecutableFunction extends UserUpdateFunction implements ExecutableFirebaseFunction<UserUpdateFunction.Parameters, null> {

    public async execute(userAuthId: UserAuthId | null, parameters: UserUpdateFunction.Parameters): Promise<null> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated');

        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (!userAuthSnapshot.exists)
            throw new FunctionsError('permission-denied', 'User authentication does not exist');
        const userId = User.Id.builder.build(userAuthSnapshot.data.userId);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('permission-denied', 'User does not exist');
        const user = User.builder.build(userSnapshot.data);

        if (parameters.name !== 'do-not-update') {
            user.properties.firstName = parameters.name.firstName;
            user.properties.lastName = parameters.name.lastName;
        }

        if (parameters.bio !== 'do-not-update')
            user.properties.bio = parameters.bio === 'remove' ? null : parameters.bio;

        if (parameters.profilePictureUrl !== 'do-not-update')
            user.properties.profilePictureUrl = parameters.profilePictureUrl === 'remove' ? null : parameters.profilePictureUrl;

        if (parameters.notificationSubscriptions !== 'do-not-update')
            user.settings.notification.subscriptions = parameters.notificationSubscriptions;

        await Firestore.shared.user(userId).set(user);

        return null;
    }
}
