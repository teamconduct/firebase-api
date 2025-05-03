import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { User } from '../../types';
import { ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Firestore } from '../../Firestore';

export class UserLoginFunction extends FirebaseFunction<null, User> {

    public parametersBuilder = new ValueTypeBuilder<null>();


    public returnTypeBuilder = User.builder;

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
