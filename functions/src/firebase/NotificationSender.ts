import { Dictionary, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { Fine, FineAmount, InAppNotification, Localization, NotificationProperties, Person, Team, User } from '@stevenkellner/team-conduct-api';
import { Firestore } from './Firestore';
import { FirebaseConfiguration, Notification, BatchResponse } from '.';

function successfulTokenDict(response: BatchResponse, tokens: string[]): Dictionary<NotificationProperties.TokenId, string> {
    const tokenDict = new Dictionary<NotificationProperties.TokenId, string>(NotificationProperties.TokenId.builder);
    response.responses.forEach((r, index) => {
        const tokenFailed =
            r.error?.code === 'messaging/invalid-registration-token' ||
            r.error?.code === 'messaging/registration-token-not-registered';
        if (!tokenFailed)
            tokenDict.set(NotificationProperties.TokenId.create(tokens[index]), tokens[index]);
    });
    return tokenDict;
}

export class NotificationSender {

    private constructor(
        private readonly teamId: Team.Id,
        private readonly personId: Person.Id
    ) {}

    public static for(teamId: Team.Id, personId: Person.Id): NotificationSender {
        return new NotificationSender(teamId, personId);
    }

    public static forUser(userId: User.Id): NotificationSenderForUser {
        return new NotificationSenderForUser(userId);
    }

    public async newFine(fineId: Fine.Id, reason: string, amount: FineAmount, teamSettings: Team.TeamSettings): Promise<void> {
        const localization = Localization.shared(teamSettings.locale);
        await this.send(
            'new-fine',
            {
                title: localization.notification.fine.new.title.value({ reason }),
                body: localization.notification.fine.new.body.value({
                    amount: amount.formatted(teamSettings.currency, teamSettings.locale)
                })
            },
            { type: 'fine-added', teamId: this.teamId, fineId, reason }
        );
    }

    public async finePayed(fineId: Fine.Id, reason: string, amount: FineAmount, teamSettings: Team.TeamSettings): Promise<void> {
        const localization = Localization.shared(teamSettings.locale);
        await this.send(
            'fine-state-change',
            {
                title: localization.notification.fine.stateChange.title.value(),
                body: localization.notification.fine.stateChange.bodyPayed.value({
                    reason,
                    amount: amount.formatted(teamSettings.currency, teamSettings.locale)
                })
            },
            { type: 'fine-payed', teamId: this.teamId, fineId, reason }
        );
    }

    public async fineUnpayed(fineId: Fine.Id, reason: string, amount: FineAmount, teamSettings: Team.TeamSettings): Promise<void> {
        const localization = Localization.shared(teamSettings.locale);
        await this.send(
            'fine-state-change',
            {
                title: localization.notification.fine.stateChange.title.value(),
                body: localization.notification.fine.stateChange.bodyUnpayed.value({
                    reason,
                    amount: amount.formatted(teamSettings.currency, teamSettings.locale)
                })
            },
            { type: 'fine-updated', teamId: this.teamId, fineId, reason }
        );
    }

    public async fineChanged(fineId: Fine.Id, reason: string, teamSettings: Team.TeamSettings): Promise<void> {
        const localization = Localization.shared(teamSettings.locale);
        await this.send(
            'fine-changed',
            {
                title: localization.notification.fine.changed.title.value({ reason }),
                body: localization.notification.fine.changed.body.value({ reason })
            },
            { type: 'fine-updated', teamId: this.teamId, fineId, reason }
        );
    }

    public async fineDeleted(reason: string, amount: FineAmount, teamSettings: Team.TeamSettings): Promise<void> {
        const localization = Localization.shared(teamSettings.locale);
        await this.send(
            'fine-state-change',
            {
                title: localization.notification.fine.stateChange.title.value(),
                body: localization.notification.fine.stateChange.bodyDeleted.value({
                    reason,
                    amount: amount.formatted(teamSettings.currency, teamSettings.locale)
                })
            },
            { type: 'fine-deleted', teamId: this.teamId, reason }
        );
    }

    public async personRoleChanged(): Promise<void> {
        await this.sendInApp({ type: 'person-role-changed', teamId: this.teamId });
    }

    private async send(
        topic: NotificationProperties.Subscription,
        pushContent: Notification,
        event: InAppNotification.Event
    ): Promise<void> {
        const personSnapshot = await Firestore.shared.person(this.teamId, this.personId).snapshot();
        if (!personSnapshot.exists || personSnapshot.data.signInProperties === null)
            return;

        const userId = User.Id.builder.build(personSnapshot.data.signInProperties.userId);
        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            return;
        const user = User.builder.build(userSnapshot.data);

        await Promise.all([
            this.sendPush(user, userId, topic, pushContent),
            this.storeInApp(userId, event)
        ]);
    }

    private async sendInApp(event: InAppNotification.Event): Promise<void> {
        const personSnapshot = await Firestore.shared.person(this.teamId, this.personId).snapshot();
        if (!personSnapshot.exists || personSnapshot.data.signInProperties === null)
            return;

        const userId = User.Id.builder.build(personSnapshot.data.signInProperties.userId);
        await this.storeInApp(userId, event);
    }

    private async sendPush(
        user: User,
        userId: User.Id,
        topic: NotificationProperties.Subscription,
        pushContent: Notification
    ): Promise<void> {
        if (!user.settings.notification.subscriptions.includes(topic))
            return;

        const tokens = user.settings.notification.tokens.values;
        if (tokens.length === 0)
            return;

        const response = await FirebaseConfiguration.shared.messaging.sendEachForMulticast({
            tokens,
            notification: pushContent
        });
        user.settings.notification.tokens = successfulTokenDict(response, tokens);
        await Firestore.shared.user(userId).set(user);
    }

    private async storeInApp(userId: User.Id, event: InAppNotification.Event): Promise<void> {
        const notification = new InAppNotification(
            Tagged.generate('inAppNotification' as const),
            UtcDate.now,
            false,
            event
        );
        await Firestore.shared.notification(userId, notification.id).set(notification);
    }
}

export class NotificationSenderForUser {

    public constructor(private readonly userId: User.Id) {}

    public async teamKickout(teamId: Team.Id): Promise<void> {
        const notification = new InAppNotification(
            Tagged.generate('inAppNotification' as const),
            UtcDate.now,
            false,
            { type: 'team-kickout', teamId }
        );
        await Firestore.shared.notification(this.userId, notification.id).set(notification);
    }
}
