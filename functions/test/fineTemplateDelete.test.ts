import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Firestore } from '../src/Firestore';

describe('FineTemplateDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('fineTemplate not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('delete').callFunction({
            teamId: testTeam.id,
            id: Tagged.generate('fineTemplate')
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should delete fineTemplate', async () => {
        await FirebaseApp.shared.functions.function('fineTemplate').function('delete').callFunction({
            teamId: testTeam.id,
            id: testTeam.fineTemplates[1].id
        });
        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(testTeam.id, testTeam.fineTemplates[1].id).snapshot();
        expect(fineTemplateSnapshot.exists).to.be.equal(false);
    });
});
