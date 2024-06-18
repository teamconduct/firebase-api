import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged, UtcDate } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Amount } from '../src/types';
import { Firestore } from '../src/Firestore';

describe('FineUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-update');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('fine not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('update').callFunction({
            teamId: testTeam.id,
            personId: Tagged.generate('person'),
            fine: {
                id: Tagged.generate('fine'),
                reason: 'Test Reason',
                amount: new Amount(10, 0),
                date: UtcDate.now,
                payedState: 'payed'
            }
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should update fine', async () => {
        const date = UtcDate.now;
        await FirebaseApp.shared.functions.function('fine').function('update').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            fine: {
                id: testTeam.fines[1].id,
                reason: 'Test Reason',
                amount: new Amount(10, 0),
                date: date,
                payedState: 'payed'
            }
        });
        const fineSnapshot = await Firestore.shared.fine(testTeam.id, testTeam.fines[1].id).snapshot();
        expect(fineSnapshot.exists).to.be.equal(true);
        expect(fineSnapshot.data).to.be.deep.equal({
            id: testTeam.fines[1].id.guidString,
            reason: 'Test Reason',
            amount: 10,
            date: date.encoded,
            payedState: 'payed'
        });
    });
});
