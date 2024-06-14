import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';

describe('PersonDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        await FirebaseApp.shared.deleteOnlyTeam();
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('delete').callFunction({
            teamId: testTeam1.id,
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('delete').callFunction({
            teamId: testTeam1.id,
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person is signed in', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('delete').callFunction({
            teamId: testTeam1.id,
            id: testTeam1.persons[0].id
        });
        await expect(execute).to.awaitThrow('failed-precondition');
    });

    it('should delete person', async () => {
        await FirebaseApp.shared.functions.function('person').function('delete').callFunction({
            teamId: testTeam1.id,
            id: testTeam1.persons[1].id
        });
        const personSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('persons').getDocument(testTeam1.persons[1].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(false);
    });
});
