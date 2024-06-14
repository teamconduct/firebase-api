import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';

describe('FineTemplateDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        await FirebaseApp.shared.deleteOnlyTeam();
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('delete').callFunction({
            teamId: testTeam1.id,
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('fineTemplate not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('fineTemplate').function('delete').callFunction({
            teamId: testTeam1.id,
            id: Guid.generate()
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should delete fineTemplate', async () => {
        await FirebaseApp.shared.functions.function('fineTemplate').function('delete').callFunction({
            teamId: testTeam1.id,
            id: testTeam1.fineTemplates[1].id
        });
        const fineTemplateSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('fineTemplates').getDocument(testTeam1.fineTemplates[1].id.guidString).snapshot();
        expect(fineTemplateSnapshot.exists).to.be.equal(false);
    });
});
