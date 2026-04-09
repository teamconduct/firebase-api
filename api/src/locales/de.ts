import { Pluralization } from '../types/localization/Pluralization';
import { LocalizationDict } from '../types/localization/Localization';

/**
 * German (de) localization strings for the application.
 * Contains translations for notifications, fine amounts, fine template repetitions,
 * payment states, and user roles.
 *
 * Supports template variables using {{variableName}} syntax that will be replaced
 * at runtime with actual values.
 */
export const localizationDE: LocalizationDict = {
    notification: {
        fine: {
            new: {
                title: '{{reason}}',
                body: 'Du hast eine neue Strafe von {{amount}}. Bitte so schnell wie möglich zahlen.'
            },
            reminder: {
                title: 'Du hast noch offene Strafen',
                body: 'Bei dir sind noch {{amount}} offen. Bitte so schnell wie möglich zahlen.'
            },
            stateChange: {
                title: 'Eine deiner Strafen hat sich geändert',
                bodyPayed: 'Du hast eine Strafe von {{amount}} bezahlt ({{reason}}).',
                bodyUnpayed: '{{reason}}, {{amount}} ist noch offen.',
                bodyDeleted: '{{reason}}, {{amount}} wurde gelöscht.'
            },
            changed: {
                title: '{{reason}}',
                body: 'Deine Strafe für {{reason}} wurde aktualisiert.'
            }
        }
    },
    fineAmount: {
        item: {
            type: {
                crateOfBeer: {
                    name: 'Kasten Bier',
                    withCount: new Pluralization({
                        one: 'Ein Kasten Bier',
                        other: '{{count}} Kästen Bier'
                    }),
                    withoutCount: new Pluralization({
                        one: 'Kasten Bier',
                        other: 'Kästen Bier'
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
                    one: '1 Minute',
                    other: '{{count}} Minuten'
                }),
                withoutCount: new Pluralization({
                    one: 'Minute',
                    other: 'Minuten'
                })
            },
            day: {
                name: 'Tag',
                withCount: new Pluralization({
                    one: '1 Tag',
                    other: '{{count}} Tage'
                }),
                withoutCount: new Pluralization({
                    one: 'Tag',
                    other: 'Tage'
                })
            },
            item: {
                name: 'Teil',
                withCount: new Pluralization({
                    one: '1 Teil',
                    other: '{{count}} Teile'
                }),
                withoutCount: new Pluralization({
                    one: 'Teil',
                    other: 'Teile'
                })
            },
            count: {
                name: 'Anzahl',
                withCount: new Pluralization({
                    one: '1 mal',
                    other: '{{count}} mal'
                }),
                withoutCount: new Pluralization({
                    one: 'mal',
                    other: 'mal'
                })
            }
        }
    },
    payedState: {
        payed: 'Bezahlt',
        notPayed: 'Offen'
    },
    teamRole: {
        personManager: 'Personenmanager',
        fineTemplateManager: 'Strafvorlagenmanager',
        fineManager: 'Strafenmanager',
        fineCanAdd: 'Kann Strafen hinzufügen',
        teamManager: 'Teammanager'
    }
}
