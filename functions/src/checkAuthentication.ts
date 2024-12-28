import * as functions from 'firebase-functions';
import { AuthUser, ILogger } from 'firebase-function';
import { Person, User, UserId, UserRole } from './types';
import { Firestore } from './Firestore';
import { TeamId } from './types/Team';

function includesAll<T>(array: T[], ...values: T[]): boolean {
    return values.every(value => array.includes(value));
}

export async function checkAuthentication(authUser: AuthUser | null, logger: ILogger, teamId: TeamId, ...roles: UserRole[]): Promise<UserId> {
    logger.log('checkAuthentication');

    if (authUser === null)
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    const userId = UserId.builder.build(authUser.id, logger.nextIndent);

    const userSnapshot = await Firestore.shared.user(userId).snapshot();
    if (!userSnapshot.exists)
        throw new functions.https.HttpsError('permission-denied', 'User does not exist');
    const user = User.builder.build(userSnapshot.data, logger.nextIndent);

    if (!user.teams.has(teamId))
        throw new functions.https.HttpsError('permission-denied', 'User is not a member of the team');
    const team = user.teams.get(teamId);

    const personSnapshot = await Firestore.shared.person(teamId, team.personId).snapshot();
    if (!personSnapshot.exists)
        throw new functions.https.HttpsError('permission-denied', 'Person does not exist');
    const person = Person.builder.build(personSnapshot.data, logger.nextIndent);

    if (person.signInProperties === null)
        throw new functions.https.HttpsError('permission-denied', 'Person is not signed in');

    const userHasRoles = includesAll(person.signInProperties.roles, ...roles);
    if (!userHasRoles)
        throw new functions.https.HttpsError('permission-denied', 'User does not have the required roles');

    return userId;
}
