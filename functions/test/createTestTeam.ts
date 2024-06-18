import { Fine, FineTemplate, Person, PersonSignInProperties, User, UserId, UserRole } from '../src/types';
import { TeamId } from '../src/types/Team';
import { Firestore } from '../src/Firestore';

export type TestTeam = {
    id: TeamId
    name: string,
    persons: Omit<Person, 'signInProperties'>[],
    fineTemplates: FineTemplate[]
    fines: Fine[]
}

// eslint-disable-next-line camelcase
function* internal_createTestTeam(team: TestTeam, userId: UserId, roles: UserRole[]): Generator<Promise<unknown>> {
    const user = User.empty();
    user.teams.set(team.id, {
        personId: team.persons[0].id,
        roles: roles
    });
    yield Firestore.shared.user(userId).set(user);
    yield Firestore.shared.team(team.id).set({
        name: team.name,
        paypalMeLink: null
    });
    if (team.persons.length !== 0) {
        yield Firestore.shared.person(team.id, team.persons[0].id).set({
            ...team.persons[0],
            signInProperties: PersonSignInProperties.empty(userId)
        });
    }
    for (const person of team.persons.slice(1)) {
        yield Firestore.shared.person(team.id, person.id).set({
            ...person,
            signInProperties: null
        });
    }
    for (const fineTemplate of team.fineTemplates)
        yield Firestore.shared.fineTemplate(team.id, fineTemplate.id).set(fineTemplate);
    for (const fine of team.fines)
        yield Firestore.shared.fine(team.id, fine.id).set(fine);
}

export async function createTestTeam(team: TestTeam, userId: UserId, roles: UserRole[]) {
    await Promise.all([...internal_createTestTeam(team, userId, roles)]);
}
