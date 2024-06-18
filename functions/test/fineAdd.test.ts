import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged, UtcDate } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Amount, FineId } from '../src/types';
import { Firestore } from '../src/Firestore';

describe('FineAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-add');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('add').callFunction({
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

    it('fine already exists', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fine').function('add').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id,
            fine: {
                id: testTeam.fines[1].id,
                reason: 'Test Reason',
                amount: new Amount(10, 0),
                date: UtcDate.now,
                payedState: 'payed'
            }
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('should add fine', async () => {
        const fineId: FineId = Tagged.generate('fine');
        const date = UtcDate.now;
        await FirebaseApp.shared.functions.function('fine').function('add').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            fine: {
                id: fineId,
                reason: 'Test Reason',
                amount: new Amount(10, 0),
                date: date,
                payedState: 'payed'
            }
        });
        const fineSnapshot = await Firestore.shared.fine(testTeam.id, fineId).snapshot();
        expect(fineSnapshot.exists).to.be.equal(true);
        expect(fineSnapshot.data).to.be.deep.equal({
            id: fineId.guidString,
            reason: 'Test Reason',
            amount: 10,
            date: date.encoded,
            payedState: 'payed'
        });
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.fineIds.includes(fineId.guidString)).to.be.equal(true);
    });
});
