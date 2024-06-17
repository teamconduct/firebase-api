import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';

describe('NotificationSubscribeFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('subscribe').callFunction({
            teamId: testTeam.id,
            personId: Guid.generate(),
            subscriptions: ['new-fine', 'fine-reminder']
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person not signed in', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('subscribe').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id,
            subscriptions: ['new-fine', 'fine-reminder']
        });
        await expect(execute).to.awaitThrow('failed-precondition');
    });

    it('should subscribe notification', async () => {
        await FirebaseApp.shared.functions.function('notification').function('subscribe').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            subscriptions: ['new-fine', 'fine-reminder']
        });
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[0].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.equal(true);
        expect(personSnapshot.data.signInProperties?.notificationProperties.subscriptions).to.be.deep.equal(['new-fine', 'fine-reminder']);
    });
});
