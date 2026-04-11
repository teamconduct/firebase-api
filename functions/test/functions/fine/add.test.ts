import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User, Team, Person, Fine, PersonProperties, PersonSignInProperties, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('fine/add', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.add.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId(),
                    fine: RandomData.shared.fine()
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the required role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.add.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    fine: RandomData.shared.fine()
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
                () => FirebaseApp.shared.functions.fine.add.execute({
                    teamId: testTeamId,
                    personId: RandomData.shared.personId(),
                    fine: RandomData.shared.fine()
                }),
                'not-found',
                'Team not found'
            );
        });
    });

    describe('given the fine already exists', () => {
        it('should throw an already-exists error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;
            const existingFine = testTeam.fines[0];
            const personId = testTeam.persons[0].fineIds.some(id => id.guidString === existingFine.id.guidString)
                ? testTeam.persons[0].id
                : testTeam.persons[1].id;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.add.execute({
                    teamId: testTeam.id,
                    personId: personId,
                    fine: existingFine
                }),
                'already-exists',
                'Fine already exists'
            );
        });
    });

    describe('given the target person does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.add.execute({
                    teamId: testTeam.id,
                    personId: RandomData.shared.personId(),
                    fine: RandomData.shared.fine()
                }),
                'not-found',
                'Person not found'
            );
        });
    });

    describe('given a valid setup', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should create the fine document in Firestore', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const newFine = RandomData.shared.fine();

            await FirebaseApp.shared.functions.fine.add.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[1].id,
                fine: newFine
            });

            const fineSnapshot = await FirebaseApp.shared.firestore.fine(testTeam.id, newFine.id).snapshot();
            expect(fineSnapshot.exists).toBeTrue();
        });

        it('should add the fine ID to the target person fine list', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const newFine = RandomData.shared.fine();
            const initialFineCount = testTeam.persons[1].fineIds.length;

            await FirebaseApp.shared.functions.fine.add.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[1].id,
                fine: newFine
            });

            const personSnapshot = await FirebaseApp.shared.firestore.person(testTeam.id, testTeam.persons[1].id).snapshot();
            const person = Person.builder.build(personSnapshot.data);
            expect(person.fineIds.length).toBeEqual(initialFineCount + 1);
            expect(person.fineIds.some(id => id.guidString === newFine.id.guidString)).toBeTrue();
        });
    });
});