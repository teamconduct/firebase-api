import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Firestore } from '../src/Firestore';

describe('NotificationSubscribeFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('subscribe').callFunction({
            teamId: testTeam.id,
            personId: Tagged.generate('person'),
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
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.equal(true);
        expect(personSnapshot.data.signInProperties?.notificationProperties.subscriptions).to.be.deep.equal(['new-fine', 'fine-reminder']);
    });
});
