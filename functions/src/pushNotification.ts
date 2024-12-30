import * as admin from 'firebase-admin';
import { BatchResponse, Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { Firestore } from './Firestore';
import { NotificationProperties, Person, Team } from './types';
import { Dictionary } from '@stevenkellner/typescript-common-functionality';

function successfulTokens(response: BatchResponse, tokens: string[]): Dictionary<NotificationProperties.TokenId, string> {
    const successfulTokens = response.responses
        .map((response, index) => ({
            failed: response.error?.code ==='messaging/invalid-registration-token' || response.error?.code === 'messaging/registration-token-not-registered',
            token: tokens[index]
        }))
        .filter(response => !response.failed)
        .map(response => response.token);
    const tokenDict = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
    for (const token of successfulTokens)
        tokenDict.set(NotificationProperties.TokenId.create(token), token);
    return tokenDict;
}

export async function pushNotification(teamId: Team.Id, personId: Person.Id, topic: NotificationProperties.Subscription, notification: Notification): Promise<void> {

    const personSnapshot = await Firestore.shared.person(teamId, personId).snapshot();
    if (!personSnapshot.exists)
        return;
    const person = Person.builder.build(personSnapshot.data);

    if (person.signInProperties === null || !person.signInProperties.notificationProperties.subscriptions.includes(topic))
        return;

    const tokens = person.signInProperties.notificationProperties.tokens.values;
    const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: notification
    });
    person.signInProperties.notificationProperties.tokens = successfulTokens(response, tokens);
    await Firestore.shared.person(teamId, personId).set(person);
}
