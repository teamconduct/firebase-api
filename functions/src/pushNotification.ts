import * as admin from 'firebase-admin';
import { Utf8BytesCoder, Sha512, HexBytesCoder, values, Guid, ILogger } from 'firebase-function';
import { Person } from './types';
import { NotificationSubscription } from './types/PersonNotificationProperties';
import { BatchResponse, Notification } from 'firebase-admin/lib/messaging/messaging-api';
import { Firestore } from './Firestore';

function tokenId(token: string): string {
    const tokenCoder = new Utf8BytesCoder();
    const hasher = new Sha512();
    const idCoder = new HexBytesCoder();
    const tokenBytes = tokenCoder.encode(token);
    const tokenIdBytes = hasher.hash(tokenBytes);
    const tokenId = idCoder.decode(tokenIdBytes);
    return tokenId.slice(0, 16);
}

function successfulTokens(response: BatchResponse, tokens: string[]): Record<string, string> {
    const successfulTokens = response.responses
        .map((response, index) => ({
            failed: response.error?.code ==='messaging/invalid-registration-token' || response.error?.code === 'messaging/registration-token-not-registered',
            token: tokens[index]
        }))
        .filter(response => !response.failed)
        .map(response => response.token);
    const tokensRecord: Record<string, string> = {};
    for (const token of successfulTokens)
        tokensRecord[tokenId(token)] = token;
    return tokensRecord;

}

export async function pushNotification(teamId: Guid, personId: Guid, topic: NotificationSubscription, notification: Notification, logger: ILogger): Promise<void> {

    const personSnapshot = await Firestore.shared.person(teamId, personId).snapshot();
    if (!personSnapshot.exists)
        return;
    const person = Person.builder.build(personSnapshot.data, logger.nextIndent);

    if (person.signInProperties === null || !person.signInProperties.notificationProperties.subscriptions.includes(topic))
        return;

    const tokens = values(person.signInProperties.notificationProperties.tokens);
    const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: notification
    });
    person.signInProperties.notificationProperties.tokens = successfulTokens(response, tokens);
    await Firestore.shared.person(teamId, personId).set(person);
}
