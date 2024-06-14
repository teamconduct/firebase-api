import * as admin from 'firebase-admin';
import * as serviceAccount from './team-conduct-firebase-adminsdk-yf2hn-30e5369c8f.json';
import { Flattable, Guid, UtcDate } from 'firebase-function';
import { Fine, FineTemplate, Person, UserRole } from '../src/types';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export type TestTeam = {
    id: Guid
    name: string,
    persons: Omit<Person, 'signInProperties'>[],
    fineTemplates: FineTemplate[]
    fines: Fine[]
}

// eslint-disable-next-line camelcase
function* internal_createTestTeam(team: TestTeam, userId: string, roles: UserRole[]): Generator<Promise<unknown>> {
    yield admin.app().firestore().collection('users').doc(userId).set({
        teams: [
            {
                id: team.id.guidString,
                personId: team.persons[0].id.guidString,
                roles: roles
            }
        ]
    });
    yield admin.app().firestore().collection('teams').doc(team.id.guidString).set({
        name: team.name,
        paypalMeLink: null
    });
    if (team.persons.length !== 0) {
        yield admin.app().firestore().collection('teams').doc(team.id.guidString).collection('persons').doc(team.persons[0].id.guidString).set(Flattable.flatten({
            ...team.persons[0],
            signInProperties: {
                userId: userId,
                signInDate: UtcDate.now,
                notificationTokens: {}
            }
        }));
    }
    for (const person of team.persons.slice(1)) {
        yield admin.app().firestore().collection('teams').doc(team.id.guidString).collection('persons').doc(person.id.guidString).set(Flattable.flatten({
            ...person,
            signInProperties: null
        }));
    }
    for (const fineTemplate of team.fineTemplates)
        yield admin.app().firestore().collection('teams').doc(team.id.guidString).collection('fineTemplates').doc(fineTemplate.id.guidString).set(Flattable.flatten(fineTemplate));
    for (const fine of team.fines)
        yield admin.app().firestore().collection('teams').doc(team.id.guidString).collection('fines').doc(fine.id.guidString).set(Flattable.flatten(fine));
}

export async function createTestTeam(team: TestTeam, userId: string, roles: UserRole[]) {
    await Promise.all([...internal_createTestTeam(team, userId, roles)]);
}
