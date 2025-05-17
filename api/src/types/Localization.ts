import * as i18n from 'i18n';
import { Configuration } from './Configuration';

export const localizationKey = {
    notification: {
        fine: {
            new: {
                title: 'notification.fine.new.title',
                body: 'notification.fine.new.body'
            },
            reminder: {
                title: 'notification.fine.reminder.title',
                body: 'notification.fine.reminder.body'
            },
            stateChange: {
                title: 'notification.fine.state-change.title',
                bodyPayed: 'notification.fine.state-change.body-payed',
                bodyUnpayed: 'notification.fine.state-change.body-unpayed',
                bodyDeleted: 'notification.fine.state-change.body-deleted'
            }
        }
    },
    fineAmount: {
        item: {
            type: {
                crateOfBeer: 'fineAmount.item.type.crateOfBeer'
            }
        }
    },
    fineTemplateRepetition: {
        item: {
            minute: 'fineTemplateRepetition.item.minute',
            day: 'fineTemplateRepetition.item.day',
            item: 'fineTemplateRepetition.item.item',
            count: 'fineTemplateRepetition.item.count'
        }
    },
    payedState: {
        payed: 'payedState.payed',
        notPayed: 'payedState.notPayed'
    },
    userRole: {
        personManager: 'userRole.personManager',
        fineTemplateManager: 'userRole.fineTemplateManager',
        fineManager: 'userRole.fineManager',
        teamManager: 'userRole.teamManager'
    }
}

export const localizationNKey = {
    fineAmount: {
        item: {
            type: {
                crateOfBeer: 'fineAmount.item.type.crateOfBeer?count=%s',
                crateOfBeerWithoutCount: 'fineAmount.item.type.crateOfBeerWithoutCount?count=%s'
            }
        }
    },
    fineTemplateRepetition: {
        item: {
            minute: 'fineTemplateRepetition.item.minute?count=%s',
            minuteWithoutCount: 'fineTemplateRepetition.item.minuteWithoutCount?count=%s',
            day: 'fineTemplateRepetition.item.day?count=%s',
            dayWithoutCount: 'fineTemplateRepetition.item.dayWithoutCount?count=%s',
            item: 'fineTemplateRepetition.item.item?count=%s',
            itemWithoutCount: 'fineTemplateRepetition.item.itemWithoutCount?count=%s',
            count: 'fineTemplateRepetition.item.count?count=%s',
            countWithoutCount: 'fineTemplateRepetition.item.countWithoutCount?count=%s'
        }
    }
}

export class Localization {

    public static readonly shared = new Localization();

    private constructor() {
        i18n.configure({
            locales: Configuration.Locale.all,
            defaultLocale: 'en',
            directory: 'src/locales',
            objectNotation: true
        });
    }

    public setLocale(locale: Configuration.Locale) {
        i18n.setLocale(locale);
    }

    public get(getKey: (key: typeof localizationKey) => string, ...args: string[]): string {
        const key = getKey(localizationKey);
        return i18n.__(key, ...args);
    }

    public getN(getKey: (key: typeof localizationNKey) => string, count: number): string {
        const key = getKey(localizationNKey);
        return i18n.__n(key, count);
    }
}
