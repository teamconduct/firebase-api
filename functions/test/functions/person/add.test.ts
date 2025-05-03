import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../RandomData';
import { Person } from '../../../src/types';

describe('PersonAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person already exists', async () => {
        const result = await FirebaseApp.shared.functions.person.add.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            id: FirebaseApp.shared.testTeam.persons[1].id,
            properties: RandomData.shared.personPrivateProperties()
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'Person already exists')));
    });

    it('should add person', async () => {
        const personId = RandomData.shared.personId();
        const personPrivateProperties = RandomData.shared.personPrivateProperties();
        await FirebaseApp.shared.functions.person.add.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            id: personId,
            properties: personPrivateProperties
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, personId).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data).toBeEqual(new Person(personId, personPrivateProperties).flatten);
    });
});
