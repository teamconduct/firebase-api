import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Firestore } from '../src/Firestore';

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
            personId: Tagged.generate('person'),
            id: testTeam.fines[1].id
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('fine does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id,
            id: Tagged.generate('fine')
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should delete fine', async () => {
        await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            id: testTeam.fines[1].id
        });
        const fineSnapshot = await Firestore.shared.fine(testTeam.id, testTeam.fines[1].id).snapshot();
        expect(fineSnapshot.exists).to.be.equal(false);
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.fineIds.includes(testTeam.fines[1].id.guidString)).to.be.equal(false);
    });
});
