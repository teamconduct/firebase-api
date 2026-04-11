import { describe, it, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { Person, PersonProperties, Invitation, User } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('invitation/register', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.register.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId(),
                    signInType: new User.SignInType.OAuth('google')
                }),
                'unauthenticated',
                'User is not authenticated.'
            );
        });
    });

    describe('given the person does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.auth.signIn();

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.register.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId(),
                    signInType: new User.SignInType.OAuth('google')
                }),
                'not-found',
                'Person not found.'
            );
        });
    });

    describe('given the person is already registered', () => {
        it('should throw an already-exists error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.register.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[0].id,
                    signInType: new User.SignInType.OAuth('google')
                }),
                'already-exists',
                'Person is already registered.'
            );
        });
    });

    describe('given no valid invitation exists', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.register.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    signInType: new User.SignInType.OAuth('google')
                }),
                'not-found',
                'No valid invitation found for this team and person.'
            );
        });
    });

    describe('given the team document does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.auth.signIn();
            const testTeamId = RandomData.shared.teamId();
            const testPersonId = RandomData.shared.personId();

            const person = new Person(testPersonId, new PersonProperties('Jane', 'Doe'), []);
            await FirebaseApp.shared.firestore.person(testTeamId, testPersonId).set(person);

            const personInvitation = new Invitation(testTeamId, testPersonId);
            await FirebaseApp.shared.firestore.invitation(personInvitation.createId()).set(personInvitation);

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.register.execute({
                    teamId: testTeamId,
                    personId: testPersonId,
                    signInType: new User.SignInType.OAuth('google')
                }),
                'not-found',
                'Team not found.'
            );
        });
    });

    describe('given the user is already a member of the team', () => {
        it('should throw an already-exists error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            const personInvitation = new Invitation(testTeam.id, testTeam.persons[1].id);
            await FirebaseApp.shared.firestore.invitation(personInvitation.createId()).set(personInvitation);

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.register.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    signInType: new User.SignInType.OAuth('google')
                }),
                'already-exists',
                'User is already a member of this team.'
            );
        });
    });

    describe('given a valid invitation and a new user', () => {
        it('should create the user and link to the person', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;
            const targetPerson = testTeam.persons[1];

            const personInvitation = new Invitation(testTeam.id, targetPerson.id);
            await FirebaseApp.shared.firestore.invitation(personInvitation.createId()).set(personInvitation);

            await FirebaseApp.shared.auth.signIn('newregistrant@example.com', 'NewPassw0rd!');

            const result = await FirebaseApp.shared.functions.invitation.register.execute({
                teamId: testTeam.id,
                personId: targetPerson.id,
                signInType: new User.SignInType.OAuth('google')
            });

            expect(result.teams.has(testTeam.id)).toBeTrue();

            const personSnapshot = await FirebaseApp.shared.firestore.person(testTeam.id, targetPerson.id).snapshot();
            expect(personSnapshot.exists).toBeTrue();
            const updatedPerson = Person.builder.build(personSnapshot.data);
            expect(updatedPerson.signInProperties).not.toBeNull();
        });
    });
});
