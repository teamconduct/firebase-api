import * as admin from 'firebase-admin';
import { ILogger, Dictionary } from 'firebase-function';
import { Person, PersonId } from './types';
import { NotificationSubscription, TokenId } from './types/PersonNotificationProperties';
import { BatchResponse, Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { Firestore } from './Firestore';
import { TeamId } from './types/Team';

function successfulTokens(response: BatchResponse, tokens: string[]): Dictionary<TokenId, string> {
    const successfulTokens = response.responses
        .map((response, index) => ({
            failed: response.error?.code ==='messaging/invalid-registration-token' || response.error?.code === 'messaging/registration-token-not-registered',
            token: tokens[index]
        }))
        .filter(response => !response.failed)
        .map(response => response.token);
    const tokenDict = new Dictionary<TokenId, string>();
    for (const token of successfulTokens)
        tokenDict.set(TokenId.create(token), token);
    return tokenDict;
}

export async function pushNotification(teamId: TeamId, personId: PersonId, topic: NotificationSubscription, notification: Notification, logger: ILogger): Promise<void> {

    const personSnapshot = await Firestore.shared.person(teamId, personId).snapshot();
    if (!personSnapshot.exists)
        return;
    const person = Person.builder.build(personSnapshot.data, logger.nextIndent);

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
