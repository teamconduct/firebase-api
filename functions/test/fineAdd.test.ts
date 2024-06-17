import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid, UtcDate } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Amount } from '../src/types';

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
            personId: Guid.generate(),
            fine: {
                id: Guid.generate(),
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
        const fineId = Guid.generate();
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
        const fineSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('fines').document(fineId.guidString).snapshot();
        expect(fineSnapshot.exists).to.be.equal(true);
        expect(fineSnapshot.data).to.be.deep.equal({
            id: fineId.guidString,
            reason: 'Test Reason',
            amount: 10,
            date: date.encoded,
            payedState: 'payed'
        });
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[0].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.fineIds.includes(fineId.guidString)).to.be.equal(true);
    });
});
