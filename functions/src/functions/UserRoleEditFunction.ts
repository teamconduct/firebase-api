import * as functions from 'firebase-functions';
import { ArrayTypeBuilder, FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { User, UserRole } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { firestoreBase } from '../firestoreBase';

export type Parameters = {
    userId: string
    teamId: Guid
    roles: UserRole[]
};

export class UserRoleEditFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        userId: new ValueTypeBuilder(),
        teamId: new TypeBuilder(Guid.from),
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('UserRoleEditFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('UserRoleEditFunction.execute');

        const userId = await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'userRole-manager');

        if (userId === parameters.userId && !parameters.roles.includes('userRole-manager'))
            throw new functions.https.HttpsError('invalid-argument', 'User cannot remove their own userRole-manager role');

        const userSnapshot = await firestoreBase.getSubCollection('users').getDocument(parameters.userId).snapshot();
        if (!userSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'User does not exist');

        const user = userSnapshot.data;
        if (!(parameters.teamId.guidString in user.teams))
            throw new functions.https.HttpsError('not-found', 'User is not a member of the team');

        user.teams[parameters.teamId.guidString].roles = parameters.roles;
        await firestoreBase.getSubCollection('users').getDocument(parameters.userId).setValues(User.builder.build(user, this.logger.nextIndent));
    }
}
