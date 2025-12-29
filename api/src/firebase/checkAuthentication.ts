import { FunctionsError } from '@stevenkellner/firebase-function';
import { Person, Team, User, UserRole } from '../types';
import { Firestore } from './Firestore';

/**
 * Type representing expected user role requirements.
 *
 * Can be:
 * - A single `UserRole` (user must have this role)
 * - An array of `ExpectedUserRoles` (user must satisfy ALL requirements - logical AND)
 * - An object with `anyOf` property (user must satisfy AT LEAST ONE requirement - logical OR)
 *
 * Examples:
 * - `'admin'` - User must be admin
 * - `['member', 'treasurer']` - User must be both member AND treasurer
 * - `{ anyOf: ['admin', 'treasurer'] }` - User must be admin OR treasurer
 */
type ExpectedUserRoles =
    | UserRole
    | ExpectedUserRoles[]
    | {
        anyOf: ExpectedUserRoles[];
    }

/**
 * Checks if the user has the required roles according to the expected role requirements.
 *
 * @param userRoles - Array of roles the user currently has
 * @param expectedRoles - The role requirements to check against (supports AND/OR logic)
 * @returns `true` if the user satisfies the role requirements, `false` otherwise
 */
function hasUserRoles(userRoles: UserRole[], expectedRoles: ExpectedUserRoles): boolean {
    if (Array.isArray(expectedRoles))
        return expectedRoles.every(expectedRole => hasUserRoles(userRoles, expectedRole));
    else if (typeof expectedRoles === 'object' && 'anyOf' in expectedRoles)
        return expectedRoles.anyOf.some(role => hasUserRoles(userRoles, role));
    else
        return userRoles.includes(expectedRoles);

}

/**
 * Validates that a user is authenticated and has the required roles for a specific team.
 *
 * Performs comprehensive authentication checks:
 * 1. Verifies the user is authenticated (rawUserId is not null)
 * 2. Checks that the user exists in the database
 * 3. Confirms the user is a member of the specified team
 * 4. Validates that the person associated with the user exists
 * 5. Ensures the person is signed in (has signInProperties)
 * 6. Verifies the person has the required roles
 *
 * @param rawUserId - The raw user ID string from authentication context (null if not authenticated)
 * @param teamId - The ID of the team to check membership and roles for
 * @param roles - The expected role requirements (supports AND/OR logic via ExpectedUserRoles)
 * @returns The validated User.Id if all checks pass
 * @throws {FunctionsError} 'unauthenticated' - If rawUserId is null
 * @throws {FunctionsError} 'permission-denied' - If any validation check fails
 */
export async function checkAuthentication(rawUserId: string | null, teamId: Team.Id, roles: ExpectedUserRoles): Promise<User.Id> {
    if (rawUserId === null)
        throw new FunctionsError('unauthenticated', 'User is not authenticated');

    const userAuthenticationId = await Firestore.shared.userAuthentication(rawUserId).snapshot();
    if (!userAuthenticationId.exists)
        throw new FunctionsError('permission-denied', 'User authentication does not exist');
    const userId = User.Id.builder.build(userAuthenticationId.data);

    const userSnapshot = await Firestore.shared.user(userId).snapshot();
    if (!userSnapshot.exists)
        throw new FunctionsError('permission-denied', 'User does not exist');
    const user = User.builder.build(userSnapshot.data);

    if (!user.teams.has(teamId))
        throw new FunctionsError('permission-denied', 'User is not a member of the team');
    const team = user.teams.get(teamId);

    const personSnapshot = await Firestore.shared.person(teamId, team.personId).snapshot();
    if (!personSnapshot.exists)
        throw new FunctionsError('permission-denied', 'Person does not exist');
    const person = Person.builder.build(personSnapshot.data);

    if (person.signInProperties === null)
        throw new FunctionsError('permission-denied', 'Person is not signed in');

    const userHasRoles = hasUserRoles(person.signInProperties.roles, roles);
    if (!userHasRoles)
        throw new FunctionsError('permission-denied', 'User does not have the required roles');

    return userId;
}
