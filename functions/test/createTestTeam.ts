import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { Fine, FineTemplate, Person, PersonSignInProperties, User, UserRole, Team, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { testTeam1 } from './testTeams/testTeam1';
import { FirebaseApp } from './FirebaseApp';

export type TestTeam = {
    id: Team.Id
    name: string,
    persons: Person[],
    fineTemplates: FineTemplate[]
    fines: Fine[]
}

function* internal_createTestTeam(team: TestTeam, userId: User.Id, roles: UserRole[]): Generator<Promise<unknown>> {
    const user = new User(userId);
    user.teams.set(team.id, new User.TeamProperties(team.name, team.persons[0].id));
    yield FirebaseApp.shared.firestore.user(userId).set(user);
    yield FirebaseApp.shared.firestore.team(team.id).set(new Team(team.id, team.name, null));
    for (const [index, person] of team.persons.entries()) {
        if (index === 0)
            person.signInProperties = new PersonSignInProperties(userId, UtcDate.now, new NotificationProperties(), roles);
        yield FirebaseApp.shared.firestore.person(team.id, person.id).set(person);
    }
    for (const fineTemplate of team.fineTemplates)
        yield FirebaseApp.shared.firestore.fineTemplate(team.id, fineTemplate.id).set(fineTemplate);
    for (const fine of team.fines)
        yield FirebaseApp.shared.firestore.fine(team.id, fine.id).set(fine);
}

function getTestTeam(team: TestTeam | number): TestTeam {
    if (typeof team !== 'number')
        return team;
    switch (team) {
    case 1:
        return testTeam1;
    default:
        throw new Error(`Unknown test team: ${team}`);
    }
}

export async function createTestTeam(team: TestTeam | number, userId: User.Id, roles: UserRole[]) {
    await Promise.all([...internal_createTestTeam(getTestTeam(team), userId, roles)]);
}
