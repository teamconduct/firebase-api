import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { expect } from '@assertive-ts/core';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';

describe('FineAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fine-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person does not exist', async () => {
        const result = await FirebaseApp.shared.functions.fine.add.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: RandomData.shared.personId(),
            fine: RandomData.shared.fine(),
            configuration: FirebaseApp.shared.testConfiguration
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('fine already exists', async () => {
        const result = await FirebaseApp.shared.functions.fine.add.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id,
            fine: RandomData.shared.fine(FirebaseApp.shared.testTeam.fines[1].id),
            configuration: FirebaseApp.shared.testConfiguration
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'Fine already exists')));
    });

    it('should add fine', async () => {
        const fine = RandomData.shared.fine();
        await FirebaseApp.shared.functions.fine.add.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[0].id,
            fine: fine,
            configuration: FirebaseApp.shared.testConfiguration
        });
        const fineSnapshot = await FirebaseApp.shared.firestore.fine(FirebaseApp.shared.testTeam.id, fine.id).snapshot();
        expect(fineSnapshot.exists).toBeTrue();
        expect(fineSnapshot.data).toBeEqual(fine.flatten);
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.fineIds).toContainAll(fine.id.guidString);
    });
});
