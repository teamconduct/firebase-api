import * as functions from 'firebase-functions';
import { FirebaseFunction, ILogger, ValueTypeBuilder } from 'firebase-function';
import { User } from '../types';
import { Firestore } from '../Firestore';

export class UserLoginFunction implements FirebaseFunction<null, User> {

    public parametersBuilder = new ValueTypeBuilder<null>();

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('UserLoginFunction.constructor', null, 'notice');
    }

    public async execute(): Promise<User> {
        this.logger.log('UserLoginFunction.execute');

        if (this.userId === null)
            throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated.');

        const userSnapshot = await Firestore.shared.user(this.userId).snapshot();
        if (!userSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'User not found.');

        return User.builder.build(userSnapshot.data, this.logger.nextIndent);
    }
}
