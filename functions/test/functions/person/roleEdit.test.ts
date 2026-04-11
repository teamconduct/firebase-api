import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { Person, PersonSignInProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('person/roleEdit', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.roleEdit.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId(),
                    roles: ['person-manager']
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the team-manager role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('person-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.roleEdit.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    roles: ['person-manager']
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
                () => FirebaseApp.shared.functions.person.roleEdit.execute({
                    teamId: testTeam.id,
                    personId: RandomData.shared.personId(),
                    roles: ['person-manager']
                }),
                'not-found',
                'User does not exist'
            );
        });
    });

    describe('given the target person is not signed in', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.roleEdit.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    roles: ['person-manager']
                }),
                'permission-denied',
                'User is not signed in'
            );
        });
    });

    describe('given the user tries to remove their own team-manager role', () => {
        it('should throw an unavailable error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.roleEdit.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[0].id,
                    roles: ['person-manager']
                }),
                'unavailable',
                'User cannot remove their own team-manager role'
            );
        });
    });

    describe('given a valid setup with a signed-in target person', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            const secondUserId = RandomData.shared.userId();
            testTeam.persons[1].signInProperties = new PersonSignInProperties(secondUserId, UtcDate.now, ['person-manager']);
            await FirebaseApp.shared.firestore.person(testTeam.id, testTeam.persons[1].id).set(testTeam.persons[1]);
        });

        it('should update the target person roles', async () => {
            const testTeam = FirebaseApp.shared.testTeam;

            await FirebaseApp.shared.functions.person.roleEdit.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[1].id,
                roles: ['fine-manager', 'fineTemplate-manager']
            });

            const snapshot = await FirebaseApp.shared.firestore.person(testTeam.id, testTeam.persons[1].id).snapshot();
            const updated = Person.builder.build(snapshot.data);
            const roles = updated.signInProperties!.roles.slice().sort();
            expect(roles).toBeEqual((['fine-manager', 'fineTemplate-manager'] as const).slice().sort());
        });
    });
});
