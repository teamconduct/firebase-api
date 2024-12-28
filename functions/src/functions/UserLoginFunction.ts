import * as functions from 'firebase-functions';
import { AuthUser, FirebaseFunction, ILogger, ValueTypeBuilder } from 'firebase-function';
import { User, UserId } from '../types';
import { Firestore } from '../Firestore';

export class UserLoginFunction implements FirebaseFunction<null, User> {

    public parametersBuilder = new ValueTypeBuilder<null>();

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('UserLoginFunction.constructor', null, 'notice');
    }

    public async execute(): Promise<User> {
        this.logger.log('UserLoginFunction.execute');

        if (this.authUser === null)
            throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated.');
        const userId = UserId.builder.build(this.authUser.id, this.logger.nextIndent);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'User not found.');

        return User.builder.build(userSnapshot.data, this.logger.nextIndent);
    }
}
