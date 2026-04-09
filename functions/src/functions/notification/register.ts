import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { NotificationProperties, NotificationRegisterFunction, User } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class NotificationRegisterExecutableFunction extends NotificationRegisterFunction implements ExecutableFirebaseFunction<NotificationRegisterFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: NotificationRegisterFunction.Parameters): Promise<void> {

        const userId = await checkAuthentication(userAuthId, parameters.teamId, {
            anyOf: ['team-manager', 'fine-manager', 'fine-can-add', 'fineTemplate-manager', 'person-manager']
        });

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found');
        const user = User.builder.build(userSnapshot.data);

        const tokenId = NotificationProperties.TokenId.create(parameters.token);
        user.settings.notification.tokens.set(tokenId, parameters.token);

        await Firestore.shared.user(userId).set(user);
    }
}
