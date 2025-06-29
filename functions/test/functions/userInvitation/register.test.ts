import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Dictionary, Result, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';
import { Invitation, PersonSignInProperties, Team, User } from '@stevenkellner/team-conduct-api';

describe.only('InvitationRegisterFunction', () => {

    let userId: User.Id;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('not signed in', async () => {
        await FirebaseApp.shared.auth.signOut();
        const result = await FirebaseApp.shared.functions.invitation.register.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('unauthenticated', 'User not authenticated')));
    });

    it('user already in team', async () => {
        const result = await FirebaseApp.shared.functions.invitation.register.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'User already in team')));
    });

    it('team not found', async () => {
        const result = await FirebaseApp.shared.functions.invitation.register.executeWithResult({
            teamId: RandomData.shared.teamId(),
            personId: FirebaseApp.shared.testTeam.persons[1].id
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Team not found')));
    });

    it('person not found', async () => {
        await FirebaseApp.shared.firestore.user(userId).remove();
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id).remove();
        const result = await FirebaseApp.shared.functions.invitation.register.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('person already registered', async () => {
        await FirebaseApp.shared.firestore.user(userId).remove();
        const person = FirebaseApp.shared.testTeam.persons[1];
        person.signInProperties = new PersonSignInProperties(userId, UtcDate.now);
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, person.id).set(person);
        const result = await FirebaseApp.shared.functions.invitation.register.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: person.id
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'Person already registered')));
    });

    it('register not existing user', async () => {
        const person = FirebaseApp.shared.testTeam.persons[1];
        person.signInProperties = null;
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, person.id).set(person);
        const invitationId = await FirebaseApp.shared.functions.invitation.invite.execute(new Invitation(
            FirebaseApp.shared.testTeam.id,
            FirebaseApp.shared.testTeam.persons[1].id
        ));
        await FirebaseApp.shared.firestore.user(userId).remove();
        const user = await FirebaseApp.shared.functions.invitation.register.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id
        });
        expect(user).toBeEqual(new User(userId, new Dictionary(Team.Id.builder, {
            [FirebaseApp.shared.testTeam.id.guidString]: new User.TeamProperties(FirebaseApp.shared.testTeam.name, FirebaseApp.shared.testTeam.persons[1].id)
        })));
        const invitationSnapshot = await FirebaseApp.shared.firestore.invitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeFalse();
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(userSnapshot.exists).toBeTrue();
        expect(userSnapshot.data).toBeEqual({
            id: userId.value,
            teams: {
                [FirebaseApp.shared.testTeam.id.guidString]: {
                    name: FirebaseApp.shared.testTeam.name,
                    personId: FirebaseApp.shared.testTeam.persons[1].id.guidString
                }
            }
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.signInProperties !== null).toBeEqual(true);
        expect(personSnapshot.data).toBeEqual({
            ...personSnapshot.data,
            signInProperties: {
                userId: userId.value,
                signInDate: personSnapshot.data.signInProperties!.signInDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                },
                roles: []
            }
        });
    });

    it('register existing user', async () => {
        const person = FirebaseApp.shared.testTeam.persons[1];
        person.signInProperties = null;
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, person.id).set(person);
        const invitationId = await FirebaseApp.shared.functions.invitation.invite.execute(new Invitation(
            FirebaseApp.shared.testTeam.id,
            FirebaseApp.shared.testTeam.persons[1].id
        ));
        const signedInUser = new User(userId);
        signedInUser.teams.set(RandomData.shared.teamId(), new User.TeamProperties('team-1', Tagged.generate('person')));
        await FirebaseApp.shared.firestore.user(userId).set(signedInUser);
        const user = await FirebaseApp.shared.functions.invitation.register.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id
        });
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(userSnapshot.exists).toBeTrue();
        expect(userSnapshot.data).toBeEqual({
            id: userId.value,
            teams: {
                ...userSnapshot.data.teams,
                [FirebaseApp.shared.testTeam.id.guidString]: {
                    name: FirebaseApp.shared.testTeam.name,
                    personId: FirebaseApp.shared.testTeam.persons[1].id.guidString
                }
            }
        });
        signedInUser.teams.set(FirebaseApp.shared.testTeam.id, new User.TeamProperties(FirebaseApp.shared.testTeam.name, FirebaseApp.shared.testTeam.persons[1].id));
        expect(user).toBeEqual(new User(userId, signedInUser.teams));
        const invitationSnapshot = await FirebaseApp.shared.firestore.invitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeFalse();
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.signInProperties !== null).toBeEqual(true);
        expect(personSnapshot.data).toBeEqual({
            ...personSnapshot.data,
            signInProperties: {
                userId: userId.value,

                signInDate: personSnapshot.data.signInProperties!.signInDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                },
                roles: []
            }
        });
    });
});
