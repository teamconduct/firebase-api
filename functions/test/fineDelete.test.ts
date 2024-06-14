import * as admin from 'firebase-admin';
import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';

describe('FineDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        await admin.app().firestore().collection('teams').doc(testTeam1.id.guidString).delete();
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam1.id,
            personId: Guid.generate(),
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam1.id,
            personId: Guid.generate(),
            id: testTeam1.fines[1].id
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('fine does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id,
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should delete fine', async () => {
        await FirebaseApp.shared.functions.function('fine').function('delete').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id,
            id: testTeam1.fines[1].id
        });
        const fineSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('fines').getDocument(testTeam1.fines[1].id.guidString).snapshot();
        expect(fineSnapshot.exists).to.be.equal(false);
        const personSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('persons').getDocument(testTeam1.persons[1].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.fineIds.includes(testTeam1.fines[1].id.guidString)).to.be.equal(false);
    });
});
