import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';

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
            id: Guid.generate()
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
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[1].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(false);
    });
});
