import * as functions from 'firebase-functions';
import { Guid, ILogger } from 'firebase-function';
import { UserRole } from './types';
import { firestoreBase } from './firestoreBase';

function includesAll<T>(array: T[], ...values: T[]): boolean {
    return values.every(value => array.includes(value));
}

export async function checkAuthentication(userId: string | null, logger: ILogger, teamId: Guid, ...roles: UserRole[]): Promise<string> {
    logger.log('checkAuthentication');
    if (userId === null)
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    const userSnapshot = await firestoreBase.getSubCollection('users').getDocument(userId).snapshot();
    if (!userSnapshot.exists)
        throw new functions.https.HttpsError('permission-denied', 'User does not exist');
    const userTeam = userSnapshot.data.teams.find(team => team.id === teamId.guidString);
    if (userTeam === undefined)
        throw new functions.https.HttpsError('permission-denied', 'User is not a member of the team');
    const userHasRoles = includesAll(userTeam.roles, ...roles);
    if (!userHasRoles)
        throw new functions.https.HttpsError('permission-denied', 'User does not have the required roles');
    return userId;
}
