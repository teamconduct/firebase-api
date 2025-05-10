import { FunctionsError } from '@stevenkellner/firebase-function';
import { Person, Team, User, UserRole } from './types';
import { Firestore } from './Firestore';

function includesAll<T>(array: T[], ...values: T[]): boolean {
    return values.every(value => array.includes(value));
}

export async function checkAuthentication(rawUserId: string | null, teamId: Team.Id, ...roles: UserRole[]): Promise<User.Id> {
    if (rawUserId === null)
        throw new FunctionsError('unauthenticated', 'User is not authenticated');
    const userId = User.Id.builder.build(rawUserId);

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

    const userHasRoles = includesAll(person.signInProperties.roles, ...roles);
    if (!userHasRoles)
        throw new FunctionsError('permission-denied', 'User does not have the required roles');

    return userId;
}
