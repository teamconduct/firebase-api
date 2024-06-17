import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';

describe('FineTemplateDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('fineTemplate not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('delete').callFunction({
            teamId: testTeam.id,
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should delete fineTemplate', async () => {
        await FirebaseApp.shared.functions.function('fineTemplate').function('delete').callFunction({
            teamId: testTeam.id,
            id: testTeam.fineTemplates[1].id
        });
        const fineTemplateSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('fineTemplates').document(testTeam.fineTemplates[1].id.guidString).snapshot();
        expect(fineTemplateSnapshot.exists).to.be.equal(false);
    });
});
