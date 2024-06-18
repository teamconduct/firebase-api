import * as functions from 'firebase-functions';
import { ILogger } from 'firebase-function';
import { User, UserId, UserRole } from './types';
import { Firestore } from './Firestore';
import { TeamId } from './types/Team';

function includesAll<T>(array: T[], ...values: T[]): boolean {
    return values.every(value => array.includes(value));
}

export async function checkAuthentication(_userId: string | null, logger: ILogger, teamId: TeamId, ...roles: UserRole[]): Promise<UserId> {
    logger.log('checkAuthentication');

    if (_userId === null)
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    const userId = UserId.builder.build(_userId, logger.nextIndent);

    const userSnapshot = await Firestore.shared.user(userId).snapshot();
    if (!userSnapshot.exists)
        throw new functions.https.HttpsError('permission-denied', 'User does not exist');
    const user = User.builder.build(userSnapshot.data, logger.nextIndent);

    if (!user.teams.has(teamId))
        throw new functions.https.HttpsError('permission-denied', 'User is not a member of the team');
    const userTeam = user.teams.get(teamId);

    const userHasRoles = includesAll(userTeam.roles, ...roles);
    if (!userHasRoles)
        throw new functions.https.HttpsError('permission-denied', 'User does not have the required roles');

    return userId;
}
