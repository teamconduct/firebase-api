import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { User, Team, Person, Invitation, PersonSignInProperties, PersonProperties, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('invitation/invite', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.invite.execute(
                    new Invitation(RandomData.shared.teamId(), RandomData.shared.personId())
                ),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have team-manager role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('person-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.invite.execute(
                    new Invitation(testTeam.id, testTeam.persons[1].id)
                ),
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
                () => FirebaseApp.shared.functions.invitation.invite.execute(
                    new Invitation(testTeamId, null)
                ),
                'not-found',
                'Team not found.'
            );
        });
    });

    describe('given the team is invite-only and no personId is specified', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;
            await FirebaseApp.shared.firestore.team(testTeam.id).set(
                new Team(testTeam.id, testTeam.name, null, null, null,
                    new Team.Settings(null, true, 'all-fines', 'invite-only', 'USD', 'en'))
            );

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.invite.execute(
                    new Invitation(testTeam.id, null)
                ),
                'permission-denied',
                'Team is invite-only; a person ID is required for direct invitations.'
            );
        });
    });

    describe('given the specified person does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.invite.execute(
                    new Invitation(testTeam.id, RandomData.shared.personId())
                ),
                'not-found',
                'Person not found.'
            );
        });
    });

    describe('given the specified person is already registered', () => {
        it('should throw an already-exists error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.invitation.invite.execute(
                    new Invitation(testTeam.id, testTeam.persons[0].id)
                ),
                'already-exists',
                'Person is already registered.'
            );
        });
    });

    describe('given a valid invite for a specific person', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should create the invitation and return its ID', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const invitation = new Invitation(testTeam.id, testTeam.persons[1].id);
            const expectedId = invitation.createId();

            const result = await FirebaseApp.shared.functions.invitation.invite.execute(invitation);

            expect(result.value).toBeEqual(expectedId.value);
            const stored = await FirebaseApp.shared.firestore.invitation(expectedId).snapshot();
            expect(stored.exists).toBeTrue();
        });
    });

    describe('given a valid open invite with no specific person', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should create the team-wide invitation and return its ID', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const invitation = new Invitation(testTeam.id, null);
            const expectedId = invitation.createId();

            const result = await FirebaseApp.shared.functions.invitation.invite.execute(invitation);

            expect(result.value).toBeEqual(expectedId.value);
            const stored = await FirebaseApp.shared.firestore.invitation(expectedId).snapshot();
            expect(stored.exists).toBeTrue();
        });
    });
});
