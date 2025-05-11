import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';

describe('PersonDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person not found', async () => {
        const result = await FirebaseApp.shared.functions.person.delete.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            id: RandomData.shared.personId()
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('person is signed in', async () => {
        const result = await FirebaseApp.shared.functions.person.delete.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            id: FirebaseApp.shared.testTeam.persons[0].id
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('failed-precondition', 'Person is signed in')));
    });

    it('should delete person', async () => {
        await FirebaseApp.shared.functions.person.delete.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            id: FirebaseApp.shared.testTeam.persons[1].id
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).toBeFalse();
    });
});
