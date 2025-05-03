import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../RandomData';

describe('FineTemplateUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('fineTemplate not found', async () => {
        const result = await FirebaseApp.shared.functions.fineTemplate.update.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            fineTemplate: RandomData.shared.fineTemplate()
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'FineTemplate not found')));
    });

    it('should update fineTemplate', async () => {
        const fineTemplate = RandomData.shared.fineTemplate(FirebaseApp.shared.testTeam.fineTemplates[1].id);
        await FirebaseApp.shared.functions.fineTemplate.update.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            fineTemplate: fineTemplate
        });
        const fineTemplateSnapshot = await FirebaseApp.shared.firestore.fineTemplate(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.fineTemplates[1].id).snapshot();
        expect(fineTemplateSnapshot.exists).toBeTrue();
        expect(fineTemplateSnapshot.data).toBeEqual(fineTemplate.flatten);
    });
});
