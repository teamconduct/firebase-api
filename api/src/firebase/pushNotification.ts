import { Dictionary } from '@stevenkellner/typescript-common-functionality';
import { Firestore } from './Firestore';
import { NotificationProperties, Person, Team } from '../types';
import { FirebaseConfiguration, BatchResponse, Notification } from '.';

/**
 * Filters successful tokens from a Firebase Cloud Messaging batch response.
 *
 * Removes tokens that failed due to invalid or unregistered registration tokens,
 * keeping only the tokens that successfully received the notification.
 *
 * @param response - The batch response from Firebase Cloud Messaging
 * @param tokens - The array of device tokens that were sent the notification
 * @returns A dictionary mapping token IDs to their corresponding device tokens for successful deliveries
 *
 * @remarks
 * Filters out tokens with the following error codes:
 * - `messaging/invalid-registration-token`: The token format is invalid
 * - `messaging/registration-token-not-registered`: The token is no longer registered
 *
 * @private
 */
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

/**
 * Sends a push notification to a person if they are subscribed to the topic.
 *
 * Retrieves the person's notification properties, checks their subscription status,
 * sends the notification to all their registered device tokens, and updates their
 * token list to remove any failed tokens.
 *
 * @param teamId - The unique identifier of the team
 * @param personId - The unique identifier of the person
 * @param topic - The notification subscription topic (e.g., 'new-fine', 'fine-reminder', 'fine-state-change')
 * @param notification - The notification content to send
 *
 * @returns A promise that resolves when the notification is sent and person data is updated
 *
 * @remarks
 * The function will silently return without sending if:
 * - The person does not exist in the database
 * - The person is not signed in (signInProperties is null)
 * - The person is not subscribed to the specified topic
 *
 * After sending, the person's token list is automatically updated to remove
 * any tokens that are invalid or unregistered, maintaining clean notification data.
 *
 * @example
 * ```typescript
 * await pushNotification(
 *   teamId,
 *   personId,
 *   'new-fine',
 *   {
 *     title: 'New Fine',
 *     body: 'You have received a new fine'
 *   }
 * );
 * ```
 */
export async function pushNotification(teamId: Team.Id, personId: Person.Id, topic: NotificationProperties.Subscription, notification: Notification): Promise<void> {

    const personSnapshot = await Firestore.shared.person(teamId, personId).snapshot();
    if (!personSnapshot.exists)
        return;
    const person = Person.builder.build(personSnapshot.data);

    if (person.signInProperties === null || !person.signInProperties.notificationProperties.subscriptions.includes(topic))
        return;

    const tokens = person.signInProperties.notificationProperties.tokens.values;
    const response = await FirebaseConfiguration.shared.messaging.sendEachForMulticast({
        tokens: tokens,
        notification: notification
    });
    person.signInProperties.notificationProperties.tokens = successfulTokens(response, tokens);
    await Firestore.shared.person(teamId, personId).set(person);
}
