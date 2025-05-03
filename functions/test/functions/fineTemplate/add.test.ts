import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../RandomData';

describe('FineTemplateAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('fineTemplate already exists', async () => {
        const result = await FirebaseApp.shared.functions.fineTemplate.add.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            fineTemplate: RandomData.shared.fineTemplate(FirebaseApp.shared.testTeam.fineTemplates[1].id)
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'FineTemplate already exists')));
    });

    it('should add fineTemplate', async () => {
        const fineTemplate = RandomData.shared.fineTemplate();
        await FirebaseApp.shared.functions.fineTemplate.add.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            fineTemplate: fineTemplate
        });
        const fineTemplateSnapshot = await FirebaseApp.shared.firestore.fineTemplate(FirebaseApp.shared.testTeam.id, fineTemplate.id).snapshot();
        expect(fineTemplateSnapshot.exists).toBeTrue();
        expect(fineTemplateSnapshot.data).toBeEqual(fineTemplate.flatten);
    });
});
