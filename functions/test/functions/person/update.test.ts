import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { Person, PersonProperties } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('person/update', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.update.execute({
                    teamId: RandomData.shared.teamId(),
                    id: RandomData.shared.personId(),
                    properties: new PersonProperties('Updated', 'Person', null)
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the required role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('fine-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.update.execute({
                    teamId: testTeam.id,
                    id: testTeam.persons[1].id,
                    properties: new PersonProperties('Updated', 'Person', null)
                }),
                'permission-denied'
            );
        });
    });

    describe('given the target person does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.update.execute({
                    teamId: testTeam.id,
                    id: RandomData.shared.personId(),
                    properties: new PersonProperties('Updated', 'Person', null)
                }),
                'not-found',
                'Person not found'
            );
        });
    });

    describe('given a valid team-manager and an existing person', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should update the person properties', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const targetPerson = testTeam.persons[1];

            await FirebaseApp.shared.functions.person.update.execute({
                teamId: testTeam.id,
                id: targetPerson.id,
                properties: new PersonProperties('Updated', 'Person', null)
            });

            const snapshot = await FirebaseApp.shared.firestore.person(testTeam.id, targetPerson.id).snapshot();
            const updated = Person.builder.build(snapshot.data);
            expect(updated.properties.firstName).toBeEqual('Updated');
            expect(updated.properties.lastName).toBeEqual('Person');
        });

        it('should preserve the sign-in properties and fine IDs', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const targetPerson = testTeam.persons[1];

            await FirebaseApp.shared.functions.person.update.execute({
                teamId: testTeam.id,
                id: targetPerson.id,
                properties: new PersonProperties('Updated', 'Person', null)
            });

            const snapshot = await FirebaseApp.shared.firestore.person(testTeam.id, targetPerson.id).snapshot();
            const updated = Person.builder.build(snapshot.data);
            expect(updated.signInProperties).toBeNull();
            expect(updated.fineIds).toBeEqual(targetPerson.fineIds);
        });
    });
});
