import { expect } from "@assertive-ts/core";
import { FirebaseApp } from "../../FirebaseApp";
import { RandomData } from "../../RandomData";
import { Result } from "@stevenkellner/typescript-common-functionality";
import { FunctionsError } from "@stevenkellner/firebase-function/admin";

describe('FineUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('fine not found', async () => {
        const result = await FirebaseApp.shared.functions.fine.update.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: RandomData.shared.personId(),
            fine: RandomData.shared.fine(),
            configuration: FirebaseApp.shared.testConfiguration
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Fine not found')));
    });

    it('should update fine', async () => {
        const fine = RandomData.shared.fine(FirebaseApp.shared.testTeam.fines[1].id);
        await FirebaseApp.shared.functions.fine.update.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[0].id,
            fine: fine,
            configuration: FirebaseApp.shared.testConfiguration
        });
        const fineSnapshot = await FirebaseApp.shared.firestore.fine(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.fines[1].id).snapshot();
        expect(fineSnapshot.exists).toBeTrue();
        expect(fineSnapshot.data).toBeEqual(fine.flatten);
    });
});
