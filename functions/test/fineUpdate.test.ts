import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid, UtcDate } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';
import { Amount } from '../src/types';

describe('FineUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-update');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('update').callFunction({
            teamId: Guid.generate(),
            personId: Guid.generate(),
            id: Guid.generate(),
            reason: 'Test Reason',
            amount: new Amount(10, 0),
            date: UtcDate.now,
            payedState: 'payed'
        });
        expect(execute()).to.awaitThrow('not-found');
    });

    it('fine not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('update').callFunction({
            teamId: testTeam1.id,
            personId: Guid.generate(),
            id: testTeam1.fines[1].id,
            reason: 'Test Reason',
            amount: new Amount(10, 0),
            date: UtcDate.now,
            payedState: 'payed'
        });
        expect(execute()).to.awaitThrow('not-found');
    });

    it('should update fine', async () => {
        const date = UtcDate.now;
        await FirebaseApp.shared.functions.function('fine').function('update').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id,
            id: testTeam1.fines[1].id,
            reason: 'Test Reason',
            amount: new Amount(10, 0),
            date: date,
            payedState: 'payed'
        });
        const fineSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('fines').getDocument(testTeam1.fines[1].id.guidString).snapshot();
        expect(fineSnapshot.exists).to.be.equal(true);
        expect(fineSnapshot.data).to.be.deep.equal({
            id: testTeam1.fines[1].id.guidString,
            reason: 'Test Reason',
            amount: 10,
            date: date.encoded,
            payedState: 'payed'
        });
    });
});
