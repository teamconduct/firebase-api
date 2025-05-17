import { expect } from '@assertive-ts/core';
import * as localizationEN from '../src/locales/en.json';
import * as localizationDE from '../src/locales/de.json';
import { FineAmount, FineTemplateRepetition, Localization, PayedState, UserRole } from '../src/types';
import { hasSameKeys, localizationWithoutDefault, TestedKeys } from './localization-utils';

describe('Localization for de', () => {

    const testedKeys = new TestedKeys(localizationWithoutDefault(localizationDE));

    before(() => {
        Localization.shared.setLocale('de');
    });

    after('all values should be tested', () => {
        testedKeys.checkAllTested();
    });

    it('should have the same keys as en', () => {
        hasSameKeys(localizationWithoutDefault(localizationDE), localizationWithoutDefault(localizationEN));
    });

    describe('notification.fine should be tested', () => {

        it('notification.fine.new should be tested', () => {
            testedKeys.testArgs(key => key.notification.fine.new.title, ['fine-reason'], 'fine-reason');
            testedKeys.testArgs(key => key.notification.fine.new.body, ['10,50 €'], 'Du hast eine neue Strafe von 10,50 €. Bitte so schnell wie möglich zahlen.');
        });

        it('notification.fine.reminder should be tested', () => {
            testedKeys.test(key => key.notification.fine.reminder.title, 'Du hast noch offene Strafen');
            testedKeys.testArgs(key => key.notification.fine.reminder.body, ['10,50 €'], 'Bei dir sind noch 10,50 € offen. Bitte so schnell wie möglich zahlen.');
        });

        it('notification.fine.stateChange should be tested', () => {
            testedKeys.test(key => key.notification.fine.stateChange.title, 'Eine deiner Strafen hat sich geändert');
            testedKeys.testArgs(key => key.notification.fine.stateChange.bodyPayed, ['10,50 €', 'fine-reason'], 'Du hast eine Strafe von 10,50 € bezahlt (fine-reason).');
            testedKeys.testArgs(key => key.notification.fine.stateChange.bodyUnpayed, ['10,50 €', 'fine-reason'], '10,50 €, fine-reason ist noch offen.');
            testedKeys.testArgs(key => key.notification.fine.stateChange.bodyDeleted, ['10,50 €', 'fine-reason'], '10,50 €, fine-reason wurde gelöscht.');
        });
    });

    describe('fineAmount should be tested', () => {

        it('fineAmount.item.type.crateOfBeer should be tested', () => {
            testedKeys.test(key => key.fineAmount.item.type.crateOfBeer, 'Kasten Bier');
            testedKeys.testN(key => key.fineAmount.item.type.crateOfBeer, 1, 'Ein Kasten Bier');
            testedKeys.testN(key => key.fineAmount.item.type.crateOfBeer, 4, '4 Kästen Bier');
            testedKeys.testN(key => key.fineAmount.item.type.crateOfBeerWithoutCount, 1, 'Kasten Bier');
            testedKeys.testN(key => key.fineAmount.item.type.crateOfBeerWithoutCount, 4, 'Kästen Bier');
        });

        it('fineAmount.item.type.crateOfBeer should be formatted correctly', () => {
            expect(FineAmount.Item.Type.formatted('crateOfBeer')).toBeEqual('Kasten Bier');
            expect(new FineAmount.Item('crateOfBeer', 1).formatted()).toBeEqual('Ein Kasten Bier');
            expect(new FineAmount.Item('crateOfBeer', 4).formatted()).toBeEqual('4 Kästen Bier');
            expect(new FineAmount.Item('crateOfBeer', 1).formattedWithoutCount()).toBeEqual('Kasten Bier');
            expect(new FineAmount.Item('crateOfBeer', 4).formattedWithoutCount()).toBeEqual('Kästen Bier');
        });
    });

    describe('fineTemplateRepetition should be tested', () => {

        it('fineTemplateRepetition.item.minute should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.minute, 'Minute');
            testedKeys.testN(key => key.fineTemplateRepetition.item.minute, 1, '1 Minute');
            testedKeys.testN(key => key.fineTemplateRepetition.item.minute, 4, '4 Minuten');
        });

        it('fineTemplateRepetition.item.minute should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('minute')).toBeEqual('Minute');
            expect(new FineTemplateRepetition('minute', null).formatted(1)).toBeEqual('1 Minute');
            expect(new FineTemplateRepetition('minute', null).formatted(4)).toBeEqual('4 Minuten');
        });

        it('fineTemplateRepetition.item.day should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.day, 'Tag');
            testedKeys.testN(key => key.fineTemplateRepetition.item.day, 1, '1 Tag');
            testedKeys.testN(key => key.fineTemplateRepetition.item.day, 4, '4 Tage');
        });

        it('fineTemplateRepetition.item.day should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('day')).toBeEqual('Tag');
            expect(new FineTemplateRepetition('day', null).formatted(1)).toBeEqual('1 Tag');
            expect(new FineTemplateRepetition('day', null).formatted(4)).toBeEqual('4 Tage');
        });

        it('fineTemplateRepetition.item.item should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.item, 'Teil');
            testedKeys.testN(key => key.fineTemplateRepetition.item.item, 1, '1 Teil');
            testedKeys.testN(key => key.fineTemplateRepetition.item.item, 4, '4 Teile');
        });

        it('fineTemplateRepetition.item.item should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('item')).toBeEqual('Teil');
            expect(new FineTemplateRepetition('item', null).formatted(1)).toBeEqual('1 Teil');
            expect(new FineTemplateRepetition('item', null).formatted(4)).toBeEqual('4 Teile');
        });

        it('fineTemplateRepetition.item.count should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.count, 'Anzahl');
            testedKeys.testN(key => key.fineTemplateRepetition.item.count, 1, '1 mal');
            testedKeys.testN(key => key.fineTemplateRepetition.item.count, 4, '4 mal');
        });

        it('fineTemplateRepetition.item.count should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('count')).toBeEqual('Anzahl');
            expect(new FineTemplateRepetition('count', null).formatted(1)).toBeEqual('1 mal');
            expect(new FineTemplateRepetition('count', null).formatted(4)).toBeEqual('4 mal');
        });
    });

    describe('payedState should be tested', () => {

        it('payedState.payed should be tested', () => {
            testedKeys.test(key => key.payedState.payed, 'Bezahlt');
        });

        it('payedState.payed should be formatted correctly', () => {
            expect(PayedState.formatted('payed')).toBeEqual('Bezahlt');
        });

        it('payedState.notPayed should be tested', () => {
            testedKeys.test(key => key.payedState.notPayed, 'Offen');
        });

        it('payedState.notPayed should be formatted correctly', () => {
            expect(PayedState.formatted('notPayed')).toBeEqual('Offen');
        });
    });

    describe('userRole should be tested', () => {

        it('userRole.personManager should be tested', () => {
            testedKeys.test(key => key.userRole.personManager, 'Personenmanager');
        });

        it('userRole.personManager should be formatted correctly', () => {
            expect(UserRole.formatted('person-manager')).toBeEqual('Personenmanager');
        });

        it('userRole.fineTemplateManager should be tested', () => {
            testedKeys.test(key => key.userRole.fineTemplateManager, 'Strafvorlagenmanager');
        });

        it('userRole.fineTemplateManager should be formatted correctly', () => {
            expect(UserRole.formatted('fineTemplate-manager')).toBeEqual('Strafvorlagenmanager');
        });

        it('userRole.fineManager should be tested', () => {
            testedKeys.test(key => key.userRole.fineManager, 'Strafenmanager');
        });

        it('userRole.fineManager should be formatted correctly', () => {
            expect(UserRole.formatted('fine-manager')).toBeEqual('Strafenmanager');
        });

        it('userRole.teamManager should be tested', () => {
            testedKeys.test(key => key.userRole.teamManager, 'Teammanager');
        });

        it('userRole.teamManager should be formatted correctly', () => {
            expect(UserRole.formatted('team-manager')).toBeEqual('Teammanager');
        });
    });
});
