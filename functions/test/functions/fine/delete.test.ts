import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { User, Person, PersonProperties, PersonSignInProperties, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('fine/delete', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.delete.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId(),
                    id: RandomData.shared.fineId()
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the required role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('fine-can-add');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.delete.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    id: RandomData.shared.fineId()
                }),
                'permission-denied'
            );
        });
    });

    describe('given the team document does not exist', () => {
        it('should throw a not-found error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            const testUserId = RandomData.shared.userId();
            const testTeamId = RandomData.shared.teamId();
            const testPersonId = RandomData.shared.personId();

            await FirebaseApp.shared.firestore.userAuth(authId).set({ userId: testUserId });
            const user = new User(testUserId, UtcDate.now, new User.SignInType.OAuth('google'),
                new User.Properties('J', 'D', null, null), new User.Settings(new NotificationProperties()));
            user.teams.set(testTeamId, new User.TeamProperties(testTeamId, 'Test', testPersonId));
            await FirebaseApp.shared.firestore.user(testUserId).set(user);
            const person = new Person(testPersonId, new PersonProperties('J', 'D'), []);
            person.signInProperties = new PersonSignInProperties(testUserId, UtcDate.now, ['team-manager']);
            await FirebaseApp.shared.firestore.person(testTeamId, testPersonId).set(person);

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.delete.execute({
                    teamId: testTeamId,
                    personId: RandomData.shared.personId(),
                    id: RandomData.shared.fineId()
                }),
                'not-found',
                'Team not found'
            );
        });
    });

    describe('given the fine does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.delete.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    id: RandomData.shared.fineId()
                }),
                'not-found',
                'Fine not found'
            );
        });
    });

    describe('given a valid setup', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should delete the fine document from Firestore', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const targetFineId = testTeam.persons[1].fineIds[0];

            await FirebaseApp.shared.functions.fine.delete.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[1].id,
                id: targetFineId
            });

            const fineSnapshot = await FirebaseApp.shared.firestore.fine(testTeam.id, targetFineId).snapshot();
            expect(fineSnapshot.exists).toBeFalse();
        });

        it('should remove the fine ID from the person fine list', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const targetFineId = testTeam.persons[1].fineIds[0];
            const initialFineCount = testTeam.persons[1].fineIds.length;

            await FirebaseApp.shared.functions.fine.delete.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[1].id,
                id: targetFineId
            });

            const personSnapshot = await FirebaseApp.shared.firestore.person(testTeam.id, testTeam.persons[1].id).snapshot();
            const person = Person.builder.build(personSnapshot.data);
            expect(person.fineIds.length).toBeEqual(initialFineCount - 1);
            expect(person.fineIds.some(id => id.guidString === targetFineId.guidString)).toBeFalse();
        });
    });
});
