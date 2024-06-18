import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';
import { Tagged } from 'firebase-function';
import { User, UserId } from '../src/types';
import { Firestore } from '../src/Firestore';

describe('InvitationRegisterFunction', () => {

    let userId: UserId;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam('team-invitation-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('not signed in', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await FirebaseApp.shared.auth.signOut();
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(new Tagged(invitationId, 'invitation'));
        await expect(execute).to.awaitThrow('unauthenticated');
    });

    it('invitation not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(new Tagged('no-invitation', 'invitation'));
        await expect(execute).to.awaitThrow('not-found');
    });

    it('user already in team', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(new Tagged(invitationId, 'invitation'));
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('person not found', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await Firestore.shared.user(userId).remove();
        await Firestore.shared.person(testTeam.id, testTeam.persons[1].id).remove();
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(new Tagged(invitationId, 'invitation'));
        await expect(execute).to.awaitThrow('not-found');
    });

    it('register not existing user', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await Firestore.shared.user(userId).remove();
        const user = await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(new Tagged(invitationId, 'invitation'));
        expect(user.teamId).to.be.equal(testTeam.id.guidString);
        expect(user.personId).to.be.equal(testTeam.persons[1].id.guidString);
        const invitationSnapshot = await Firestore.shared.invitation(new Tagged(invitationId, 'invitation')).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(false);
        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        expect(userSnapshot.exists).to.be.equal(true);
        expect(userSnapshot.data).to.be.deep.equal({
            teams: {
                [testTeam.id.guidString]: {
                    personId: testTeam.persons[1].id.guidString,
                    roles: []
                }
            }
        });
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.deep.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            ...personSnapshot.data,
            signInProperties: {
                userId: userId.value,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                signInDate: personSnapshot.data.signInProperties!.signInDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                }
            }
        });
    });

    it('register existing user', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        const signedInUser = User.empty();
        signedInUser.teams.set(Tagged.generate('team'), {
            personId: Tagged.generate('person'),
            roles: []
        });
        await Firestore.shared.user(userId).set(signedInUser);
        const user = await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(new Tagged(invitationId, 'invitation'));
        expect(user.teamId).to.be.equal(testTeam.id.guidString);
        expect(user.personId).to.be.equal(testTeam.persons[1].id.guidString);
        const invitationSnapshot = await Firestore.shared.invitation(new Tagged(invitationId, 'invitation')).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(false);
        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        expect(userSnapshot.exists).to.be.equal(true);
        expect(userSnapshot.data).to.be.deep.equal({
            teams: {
                ...userSnapshot.data.teams,
                [testTeam.id.guidString]: {
                    personId: testTeam.persons[1].id.guidString,
                    roles: []
                }
            }
        });
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.deep.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            ...personSnapshot.data,
            signInProperties: {
                userId: userId.value,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                signInDate: personSnapshot.data.signInProperties!.signInDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                }
            }
        });
    });
});
