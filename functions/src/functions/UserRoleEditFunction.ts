import * as functions from 'firebase-functions';
import { ArrayTypeBuilder, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { User, UserId, UserRole } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type Parameters = {
    userId: UserId
    teamId: TeamId
    roles: UserRole[]
};

export class UserRoleEditFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        userId: UserId.builder,
        teamId: TeamId.builder,
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

        if (userId.value === parameters.userId.value && !parameters.roles.includes('userRole-manager'))
            throw new functions.https.HttpsError('invalid-argument', 'User cannot remove their own userRole-manager role');

        const userSnapshot = await Firestore.shared.user(parameters.userId).snapshot();
        if (!userSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'User does not exist');
        const user = User.builder.build(userSnapshot.data, this.logger.nextIndent);

        if (!user.teams.has(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'User is not a member of the team');

        user.teams.set(parameters.teamId, {
            ...user.teams.get(parameters.teamId),
            roles: parameters.roles
        });
        await Firestore.shared.user(parameters.userId).set(user);
    }
}
