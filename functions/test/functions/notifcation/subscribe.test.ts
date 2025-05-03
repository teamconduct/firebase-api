import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../RandomData';

describe('NotificationSubscribeFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person not found', async () => {
        const result = await FirebaseApp.shared.functions.notification.subscribe.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: RandomData.shared.personId(),
            subscriptions: ['new-fine', 'fine-reminder']
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('person not signed in', async () => {
        const result = await FirebaseApp.shared.functions.notification.subscribe.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[1].id,
            subscriptions: ['new-fine', 'fine-reminder']
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('unauthenticated', 'Person not signed in')));
    });

    it('should subscribe notification', async () => {
        await FirebaseApp.shared.functions.notification.subscribe.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[0].id,
            subscriptions: ['new-fine', 'fine-reminder']
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.signInProperties !== null).toBeTrue();
        expect(personSnapshot.data.signInProperties?.notificationProperties.subscriptions).toBeEqual(['new-fine', 'fine-reminder']);
    });
});
