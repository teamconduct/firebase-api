import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';
import { Amount } from '../src/types';

describe('FineTemplateAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-add');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('add').callFunction({
            teamId: Guid.generate(),
            id: Guid.generate(),
            reason: 'Test Reason',
            amount: new Amount(100, 0),
            multiple: null
        });
        expect(execute()).to.awaitThrow('not-found');
    });

    it('fineTemplate already exists', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('add').callFunction({
            teamId: testTeam1.id,
            id: testTeam1.fineTemplates[1].id,
            reason: 'Test Reason',
            amount: new Amount(100, 0),
            multiple: null
        });
        expect(execute()).to.awaitThrow('already-exists');
    });

    it('should add fineTemplate', async () => {
        const fineTemplateId = Guid.generate();
        await FirebaseApp.shared.functions.function('fineTemplate').function('add').callFunction({
            teamId: testTeam1.id,
            id: fineTemplateId,
            reason: 'Test Reason',
            amount: new Amount(100, 0),
            multiple: null
        });
        const fineTemplateSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('fineTemplates').getDocument(fineTemplateId.guidString).snapshot();
        expect(fineTemplateSnapshot.exists).to.be.equal(true);
        expect(fineTemplateSnapshot.data).to.be.deep.equal({
            id: fineTemplateId.guidString,
            reason: 'Test Reason',
            amount: 100,
            multiple: null
        });
    });
});
