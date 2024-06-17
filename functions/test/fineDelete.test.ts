import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';

describe('FineDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam.id,
            personId: Guid.generate(),
            id: testTeam.fines[1].id
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('fine does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id,
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should delete fine', async () => {
        await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            id: testTeam.fines[1].id
        });
        const fineSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('fines').document(testTeam.fines[1].id.guidString).snapshot();
        expect(fineSnapshot.exists).to.be.equal(false);
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[0].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.fineIds.includes(testTeam.fines[1].id.guidString)).to.be.equal(false);
    });
});
