import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Amount } from '../src/types';
import { Firestore } from '../src/Firestore';

describe('FineTemplateUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-update');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('fineTemplate not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('update').callFunction({
            teamId: testTeam.id,
            fineTemplate: {
                id: Tagged.generate('fineTemplate'),
                reason: 'Test Reason',
                amount: new Amount(100, 0),
                multiple: null
            }
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should update fineTemplate', async () => {
        await FirebaseApp.shared.functions.function('fineTemplate').function('update').callFunction({
            teamId: testTeam.id,
            fineTemplate: {
                id: testTeam.fineTemplates[1].id,
                reason: 'Test Reason',
                amount: new Amount(100, 0),
                multiple: null
            }
        });
        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(testTeam.id, testTeam.fineTemplates[1].id).snapshot();
        expect(fineTemplateSnapshot.exists).to.be.equal(true);
        expect(fineTemplateSnapshot.data).to.be.deep.equal({
            id: testTeam.fineTemplates[1].id.guidString,
            reason: 'Test Reason',
            amount: 100,
            multiple: null
        });
    });
});
