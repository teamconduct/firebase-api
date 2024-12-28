import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Amount, FineTemplateId } from '../src/types';
import { Firestore } from '../src/Firestore';
import { FineValue } from '../src/types/FineValue';

describe('FineTemplateAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('fineTemplate already exists', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('add').callFunction({
            teamId: testTeam.id,
            fineTemplate: {
                id: testTeam.fineTemplates[1].id,
                reason: 'Test Reason',
                value: FineValue.amount(new Amount(100, 0)),
                multiple: null
            }
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('should add fineTemplate', async () => {
        const fineTemplateId: FineTemplateId = Tagged.generate('fineTemplate');
        await FirebaseApp.shared.functions.function('fineTemplate').function('add').callFunction({
            teamId: testTeam.id,
            fineTemplate: {
                id: fineTemplateId,
                reason: 'Test Reason',
                value: FineValue.item('crateOfBeer', 1),
                multiple: null
            }
        });
        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(testTeam.id, fineTemplateId).snapshot();
        expect(fineTemplateSnapshot.exists).to.be.equal(true);
        expect(fineTemplateSnapshot.data).to.be.deep.equal({
            id: fineTemplateId.guidString,
            reason: 'Test Reason',
            value: {
                type: 'item',
                item: 'crateOfBeer',
                count: 1
            },
            multiple: null
        });
    });
});
