import { Pluralization } from '../types/Pluralization';

export const localizationEN = {
    notification: {
        fine: {
            new: {
                title: '{{reason}}',
                body: 'You have a new fine of {{amount}}. Please pay it as soon as possible.'
            },
            reminder: {
                title: 'You still have outstanding fines',
                body: 'You still have {{amount}} outstanding. Please pay as soon as possible.'
            },
            stateChange: {
                title: 'One of your fines has changed',
                bodyPayed: 'You have paid a fine of {{amount}} ({{reason}}).',
                bodyUnpayed: '{{reason}}, {{amount}} is still outstanding.',
                bodyDeleted: '{{reason}}, {{amount}} has been deleted.'
            }
        }
    },
    fineAmount: {
        item: {
            type: {
                crateOfBeer: {
                    name: 'Crate of Beer',
                    withCount: new Pluralization({
                        one: 'a crate of beer',
                        other: '{{count}} crates of beer'
                    }),
                    withoutCount: new Pluralization({
                        one: 'Crate of Beer',
                        other: 'Crates of Beer'
                    })
                }
            }
        }
    },
    fineTemplateRepetition: {
        item: {
            minute: {
                name: 'Minute',
                withCount: new Pluralization({
                    one: '1 minute',
                    other: '{{count}} minutes'
                }),
                withoutCount: new Pluralization({
                    one: 'minute',
                    other: 'minutes'
                })
            },
            day: {
                name: 'Day',
                withCount: new Pluralization({
                    one: '1 day',
                    other: '{{count}} days'
                }),
                withoutCount: new Pluralization({
                    one: 'day',
                    other: 'days'
                })
            },
            item: {
                name: 'Item',
                withCount: new Pluralization({
                    one: '1 item',
                    other: '{{count}} items'
                }),
                withoutCount: new Pluralization({
                    one: 'item',
                    other: 'items'
                })
            },
            count: {
                name: 'Count',
                withCount: new Pluralization({
                    one: '1 time',
                    other: '{{count}} times'
                }),
                withoutCount: new Pluralization({
                    one: 'time',
                    other: 'times'
                })
            }
        }
    },
    payedState: {
        payed: 'Paid',
        notPayed: 'Outstanding'
    },
    userRole: {
        personManager: 'Person Manager',
        fineTemplateManager: 'Fine Template Manager',
        fineManager: 'Fine Manager',
        fineCanAdd: 'Can add fines',
        teamManager: 'Team Manager'
    }
}
