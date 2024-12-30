import { expect } from "@assertive-ts/core";
import { FirebaseApp } from "../../FirebaseApp";
import { Result } from "@stevenkellner/typescript-common-functionality";
import { FunctionsError } from "@stevenkellner/firebase-function/admin";
import { RandomData } from "../../RandomData";

describe('FineTemplateDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('fineTemplate not found', async () => {
        const result = await FirebaseApp.shared.functions.fineTemplate.delete.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            id: RandomData.shared.fineTemplateId()
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'FineTemplate not found')));
    });

    it('should delete fineTemplate', async () => {
        await FirebaseApp.shared.functions.fineTemplate.delete.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            id: FirebaseApp.shared.testTeam.fineTemplates[1].id
        });
        const fineTemplateSnapshot = await FirebaseApp.shared.firestore.fineTemplate(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.fineTemplates[1].id).snapshot();
        expect(fineTemplateSnapshot.exists).toBeFalse();
    });
});
