import { FunctionsError } from "@stevenkellner/firebase-function/admin";
import { FirebaseApp } from "../../FirebaseApp";
import { RandomData } from "../../RandomData";
import { Result } from "@stevenkellner/typescript-common-functionality";
import { expect } from "@assertive-ts/core";

describe('FineDeleteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person does not exist', async () => {
        const result = await FirebaseApp.shared.functions.fine.delete.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: RandomData.shared.personId(),
            id: FirebaseApp.shared.testTeam.fines[1].id,
            configuration: FirebaseApp.shared.testConfiguration
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('fine does not exist', async () => {
        const result = await FirebaseApp.shared.functions.fine.delete.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id,
            id: RandomData.shared.fineId(),
            configuration: FirebaseApp.shared.testConfiguration
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Fine not found')));
    });

    it('should delete fine', async () => {
        await FirebaseApp.shared.functions.fine.delete.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[0].id,
            id: FirebaseApp.shared.testTeam.fines[1].id,
            configuration: FirebaseApp.shared.testConfiguration
        });
        const fineSnapshot = await FirebaseApp.shared.firestore.fine(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.fines[1].id).snapshot();
        expect(fineSnapshot.exists).toBeFalse();
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.fineIds).not.toContainAny(FirebaseApp.shared.testTeam.fines[1].id.guidString);
    });
});
