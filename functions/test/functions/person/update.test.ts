import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';
import { Person } from '@stevenkellner/team-conduct-api';

describe('PersonUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person not found', async () => {
        const result = await FirebaseApp.shared.functions.person.update.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            id: RandomData.shared.personId(),
            properties: RandomData.shared.personPrivateProperties()
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('should update person', async () => {
        const personPrivateProperties = RandomData.shared.personPrivateProperties();
        await FirebaseApp.shared.functions.person.update.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            id: FirebaseApp.shared.testTeam.persons[1].id,
            properties: personPrivateProperties
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        const snapshotPerson = Person.builder.build(personSnapshot.data);
        expect(personSnapshot.data).toBeEqual(new Person(FirebaseApp.shared.testTeam.persons[1].id, personPrivateProperties, snapshotPerson.fineIds, snapshotPerson.signInProperties).flatten);
    });
});
