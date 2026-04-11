import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { Person } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('person/delete', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.delete.execute({
                    teamId: RandomData.shared.teamId(),
                    id: RandomData.shared.personId()
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
                () => FirebaseApp.shared.functions.person.delete.execute({
                    teamId: testTeam.id,
                    id: testTeam.persons[1].id
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
                () => FirebaseApp.shared.functions.person.delete.execute({
                    teamId: testTeam.id,
                    id: RandomData.shared.personId()
                }),
                'not-found',
                'Person not found'
            );
        });
    });

    describe('given the target person is signed in', () => {
        it('should throw a failed-precondition error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.delete.execute({
                    teamId: testTeam.id,
                    id: testTeam.persons[0].id
                }),
                'failed-precondition',
                'Person is signed in'
            );
        });
    });

    describe('given a valid setup with an unsigned person', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should delete the person document', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const unsignedPerson = testTeam.persons[1];

            await FirebaseApp.shared.functions.person.delete.execute({
                teamId: testTeam.id,
                id: unsignedPerson.id
            });

            const personSnapshot = await FirebaseApp.shared.firestore.person(testTeam.id, unsignedPerson.id).snapshot();
            expect(personSnapshot.exists).toBeFalse();
        });

        it('should delete all fines belonging to the person', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const unsignedPerson = testTeam.persons[1];
            const fineIdsBeforeDelete = [...unsignedPerson.fineIds];

            await FirebaseApp.shared.functions.person.delete.execute({
                teamId: testTeam.id,
                id: unsignedPerson.id
            });

            for (const fineId of fineIdsBeforeDelete) {
                const fineSnapshot = await FirebaseApp.shared.firestore.fine(testTeam.id, fineId).snapshot();
                expect(fineSnapshot.exists).toBeFalse();
            }
        });
    });
});