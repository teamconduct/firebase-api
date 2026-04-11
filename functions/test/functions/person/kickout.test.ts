import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User, Person, PersonSignInProperties, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('person/kickout', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.kickout.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId()
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
                () => FirebaseApp.shared.functions.person.kickout.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id
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
                () => FirebaseApp.shared.functions.person.kickout.execute({
                    teamId: testTeam.id,
                    personId: RandomData.shared.personId()
                }),
                'not-found',
                'Person not found.'
            );
        });
    });

    describe('given the target person is not signed in', () => {
        it('should throw an unavailable error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.kickout.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id
                }),
                'unavailable',
                'User is not signed in'
            );
        });
    });

    describe('given a valid setup with a signed-in target person', () => {
        let testUserAuthId: UserAuthId;
        let secondUserId: User.Id;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
            const secondUserAuthId = await FirebaseApp.shared.auth.signIn('kickout-person2@test.com', 'Test1234!');
            secondUserId = RandomData.shared.userId();

            const testTeam = FirebaseApp.shared.testTeam;
            const secondUser = new User(
                secondUserId,
                UtcDate.now,
                new User.SignInType.OAuth('google'),
                new User.Properties('Bob', 'Target', null, null),
                new User.Settings(new NotificationProperties())
            );
            secondUser.teams.set(testTeam.id, new User.TeamProperties(testTeam.id, testTeam.name, testTeam.persons[1].id));
            await FirebaseApp.shared.firestore.user(secondUserId).set(secondUser);
            await FirebaseApp.shared.firestore.userAuth(secondUserAuthId).set({ userId: secondUserId });

            testTeam.persons[1].signInProperties = new PersonSignInProperties(secondUserId, UtcDate.now, []);
            await FirebaseApp.shared.firestore.person(testTeam.id, testTeam.persons[1].id).set(testTeam.persons[1]);

            await FirebaseApp.shared.auth.signIn();
        });

        it('should remove sign-in properties from the kicked-out person', async () => {
            const testTeam = FirebaseApp.shared.testTeam;

            await FirebaseApp.shared.functions.person.kickout.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[1].id
            });

            const personSnapshot = await FirebaseApp.shared.firestore.person(testTeam.id, testTeam.persons[1].id).snapshot();
            const person = Person.builder.build(personSnapshot.data);
            expect(person.signInProperties).toBeNull();
        });

        it('should remove the team from the kicked-out user teams', async () => {
            const testTeam = FirebaseApp.shared.testTeam;

            await FirebaseApp.shared.functions.person.kickout.execute({
                teamId: testTeam.id,
                personId: testTeam.persons[1].id
            });

            const userSnapshot = await FirebaseApp.shared.firestore.user(secondUserId).snapshot();
            const user = User.builder.build(userSnapshot.data);
            expect(user.teams.has(testTeam.id)).toBeFalse();
        });
    });
});