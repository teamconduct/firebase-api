import { Guid } from 'firebase-function';
import { Fine, FineTemplate, Person, PersonSignInProperties, UserRole } from '../src/types';
import { FirebaseApp } from './FirebaseApp';

export type TestTeam = {
    id: Guid
    name: string,
    persons: Omit<Person, 'signInProperties'>[],
    fineTemplates: FineTemplate[]
    fines: Fine[]
}

// eslint-disable-next-line camelcase
function* internal_createTestTeam(team: TestTeam, userId: string, roles: UserRole[]): Generator<Promise<unknown>> {
    yield FirebaseApp.shared.firestore.collection('users').document(userId).set({
        teams: {
            [team.id.guidString]: {
                personId: team.persons[0].id,
                roles: roles
            }
        }
    });
    yield FirebaseApp.shared.firestore.collection('teams').document(team.id.guidString).set({
        name: team.name,
        paypalMeLink: null
    });
    if (team.persons.length !== 0) {
        yield FirebaseApp.shared.firestore.collection('teams').document(team.id.guidString).collection('persons').document(team.persons[0].id.guidString).set({
            ...team.persons[0],
            signInProperties: PersonSignInProperties.empty(userId)
        });
    }
    for (const person of team.persons.slice(1)) {
        yield FirebaseApp.shared.firestore.collection('teams').document(team.id.guidString).collection('persons').document(person.id.guidString).set({
            ...person,
            signInProperties: null
        });
    }
    for (const fineTemplate of team.fineTemplates)
        yield FirebaseApp.shared.firestore.collection('teams').document(team.id.guidString).collection('fineTemplates').document(fineTemplate.id.guidString).set(fineTemplate);
    for (const fine of team.fines)
        yield FirebaseApp.shared.firestore.collection('teams').document(team.id.guidString).collection('fines').document(fine.id.guidString).set(fine);
}

export async function createTestTeam(team: TestTeam, userId: string, roles: UserRole[]) {
    await Promise.all([...internal_createTestTeam(team, userId, roles)]);
}
