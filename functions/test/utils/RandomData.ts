import { Dictionary, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { adjectives, animals, colors, names, starWars, uniqueNamesGenerator } from 'unique-names-generator';
import { Fine, FineAmount, FineTemplate, PayedState, Person, Team, User, UserRole, FineTemplateRepetition, MoneyAmount, NotificationProperties, PersonSignInProperties, PersonProperties } from '@stevenkellner/team-conduct-api';

export class RandomData {

    private constructor() {}

    public static shared = new RandomData();

    public date(): UtcDate {
        return new UtcDate(
            2000 + Math.round(Math.random() * 100),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 29),
            Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 60)
        )
    }

    public userId(): User.Id {
        return new Tagged(uniqueNamesGenerator({ dictionaries: [animals] }), 'user');
    }

    public teamId(): Team.Id {
        return Tagged.generate('team');
    }

    public personId(): Person.Id {
        return Tagged.generate('person');
    }

    public fineId(): Fine.Id {
        return Tagged.generate('fine');
    }

    public fineTemplateId(): FineTemplate.Id {
        return Tagged.generate('fineTemplate');
    }

    public teamName(): string {
        return uniqueNamesGenerator({ dictionaries: [adjectives, starWars] });
    }

    public personProperties(): PersonProperties {
        return new PersonProperties(
            uniqueNamesGenerator({ dictionaries: [names] }),
            uniqueNamesGenerator({ dictionaries: [names] })
        );
    }

    public notificationProperties(): NotificationProperties {
        return new NotificationProperties(
            new Dictionary(NotificationProperties.TokenId.builder),
            new Array(Math.floor(Math.random() * NotificationProperties.Subscription.all.length)).fill(null).map(() => NotificationProperties.Subscription.all[Math.floor(Math.random() * NotificationProperties.Subscription.all.length)])
        );
    }

    public personSignInProperties(userId: User.Id | null = null): PersonSignInProperties {
        return new PersonSignInProperties(
            userId ?? new Tagged(uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] }), 'user'),
            this.date(),
            this.notificationProperties(),
            new Array(Math.floor(Math.random() * UserRole.all.length)).fill(null).map(() => UserRole.all[Math.floor(Math.random() * UserRole.all.length)])
        );
    }

    public person(id: Person.Id | null = null, fineIds: Fine.Id[] = []): Person {
        return new Person(
            id ?? this.personId(),
            this.personProperties(),
            fineIds,
            Math.random() > 0.5 ? null : this.personSignInProperties()
        );
    }

    public moneyAmount(): MoneyAmount {
        return new MoneyAmount(
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100)
        );
    }

    public fineAmount(): FineAmount {
        if (Math.random() > 0.5) {
            return FineAmount.item(
                FineAmount.Item.Type.all[Math.floor(Math.random() * FineAmount.Item.Type.all.length)],
                Math.floor(Math.random() * 100)
            );
        }
        return FineAmount.money(this.moneyAmount());
    }

    public fine(id: Fine.Id | null = null, date: UtcDate | null = null): Fine {
        return new Fine(
            id ?? this.fineId(),
            PayedState.all[Math.floor(Math.random() * PayedState.all.length)],
            date ?? this.date(),
            uniqueNamesGenerator({ dictionaries: [adjectives, starWars] }),
            this.fineAmount()
        );
    }

    public fineTemplateRepetition(): FineTemplateRepetition {
        return new FineTemplateRepetition(
            FineTemplateRepetition.Item.all[Math.floor(Math.random() * FineTemplateRepetition.Item.all.length)],
            Math.random() > 0.5 ? null : Math.floor(Math.random() * 100)
        );
    }

    public fineTemplate(id: FineTemplate.Id | null = null): FineTemplate {
        return new FineTemplate(
            id ?? this.fineTemplateId(),
            uniqueNamesGenerator({ dictionaries: [adjectives, starWars] }),
            this.fineAmount(),
            Math.random() > 0.5 ? null : this.fineTemplateRepetition()
        );
    }
}
