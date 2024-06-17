import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';
import { Guid } from 'firebase-function';

describe('InvitationRegisterFunction', () => {

    let userId: string;

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
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(invitationId);
        await expect(execute).to.awaitThrow('unauthenticated');
    });

    it('invitation not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction('no-invitation');
        await expect(execute).to.awaitThrow('not-found');
    });

    it('user already in team', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(invitationId);
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('person not found', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await FirebaseApp.shared.firestore.collection('users').document(userId).remove();
        await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[1].id.guidString).remove();
        const execute = async () => await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(invitationId);
        await expect(execute).to.awaitThrow('not-found');
    });

    it('register not existing user', async () => {
        const invitationId = await FirebaseApp.shared.functions.function('invitation').function('invite').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id
        });
        await FirebaseApp.shared.firestore.collection('users').document(userId).remove();
        const user = await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(invitationId);
        expect(user.teamId).to.be.equal(testTeam.id.guidString);
        expect(user.personId).to.be.equal(testTeam.persons[1].id.guidString);
        const invitationSnapshot = await FirebaseApp.shared.firestore.collection('invitations').document(invitationId).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(false);
        const userSnapshot = await FirebaseApp.shared.firestore.collection('users').document(userId).snapshot();
        expect(userSnapshot.exists).to.be.equal(true);
        expect(userSnapshot.data).to.be.deep.equal({
            teams: {
                [testTeam.id.guidString]: {
                    personId: testTeam.persons[1].id.guidString,
                    roles: []
                }
            }
        });
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[1].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.deep.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            ...personSnapshot.data,
            signInProperties: {
                userId: userId,
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
        await FirebaseApp.shared.firestore.collection('users').document(userId).set({
            teams: {
                [Guid.generate().guidString]: {
                    personId: Guid.generate(),
                    roles: []
                }
            } });
        const user = await FirebaseApp.shared.functions.function('invitation').function('register').callFunction(invitationId);
        expect(user.teamId).to.be.equal(testTeam.id.guidString);
        expect(user.personId).to.be.equal(testTeam.persons[1].id.guidString);
        const invitationSnapshot = await FirebaseApp.shared.firestore.collection('invitations').document(invitationId).snapshot();
        expect(invitationSnapshot.exists).to.be.equal(false);
        const userSnapshot = await FirebaseApp.shared.firestore.collection('users').document(userId).snapshot();
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
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[1].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.deep.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            ...personSnapshot.data,
            signInProperties: {
                userId: userId,
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
