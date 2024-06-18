import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Firestore } from '../src/Firestore';

describe('PersonDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('delete').callFunction({
            teamId: testTeam.id,
            id: Tagged.generate('person')
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person is signed in', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('delete').callFunction({
            teamId: testTeam.id,
            id: testTeam.persons[0].id
        });
        await expect(execute).to.awaitThrow('failed-precondition');
    });

    it('should delete person', async () => {
        await FirebaseApp.shared.functions.function('person').function('delete').callFunction({
            teamId: testTeam.id,
            id: testTeam.persons[1].id
        });
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).to.be.equal(false);
    });
});
