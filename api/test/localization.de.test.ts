import { expect } from '@assertive-ts/core';
import { localizationEN } from '../src/locales/en';
import { localizationDE } from '../src/locales/de';
import { FineAmount, FineTemplateRepetition, Localization, PayedState, UserRole } from '../src/types';
import { hasSameKeys } from './localization-utils';

describe('Localization for de', () => {

    before(() => {
        Localization.locale = 'de';
    });

    it('should have the same keys as en', () => {
        hasSameKeys(localizationDE, localizationEN);
    });

    describe('notification.fine should be tested', () => {

        it('notification.fine.new should be tested', () => {
            expect(Localization.shared.notification.fine.new.title.value({ reason: 'fine-reason' })).toBeEqual('fine-reason');
            expect(Localization.shared.notification.fine.new.body.value({ amount: '10,50 €' })).toBeEqual('Du hast eine neue Strafe von 10,50 €. Bitte so schnell wie möglich zahlen.');
        });

        it('notification.fine.reminder should be tested', () => {
            expect(Localization.shared.notification.fine.reminder.title.value()).toBeEqual('Du hast noch offene Strafen');
            expect(Localization.shared.notification.fine.reminder.body.value({ amount: '10,50 €' })).toBeEqual('Bei dir sind noch 10,50 € offen. Bitte so schnell wie möglich zahlen.');
        });

        it('notification.fine.stateChange should be tested', () => {
            expect(Localization.shared.notification.fine.stateChange.title.value()).toBeEqual('Eine deiner Strafen hat sich geändert');
            expect(Localization.shared.notification.fine.stateChange.bodyPayed.value({ amount: '10,50 €', reason: 'fine-reason' })).toBeEqual('Du hast eine Strafe von 10,50 € bezahlt (fine-reason).');
            expect(Localization.shared.notification.fine.stateChange.bodyUnpayed.value({ amount: '10,50 €', reason: 'fine-reason' })).toBeEqual('fine-reason, 10,50 € ist noch offen.');
            expect(Localization.shared.notification.fine.stateChange.bodyDeleted.value({ amount: '10,50 €', reason: 'fine-reason' })).toBeEqual('fine-reason, 10,50 € wurde gelöscht.');
        });
    });

    describe('fineAmount should be tested', () => {

        it('fineAmount.item.type.crateOfBeer should be tested', () => {
            expect(Localization.shared.fineAmount.item.type.crateOfBeer.name.value()).toBeEqual('Kasten Bier');
            expect(Localization.shared.fineAmount.item.type.crateOfBeer.withCount.value(1)).toBeEqual('Ein Kasten Bier');
            expect(Localization.shared.fineAmount.item.type.crateOfBeer.withCount.value(4)).toBeEqual('4 Kästen Bier');
            expect(Localization.shared.fineAmount.item.type.crateOfBeer.withoutCount.value(1)).toBeEqual('Kasten Bier');
            expect(Localization.shared.fineAmount.item.type.crateOfBeer.withoutCount.value(4)).toBeEqual('Kästen Bier');
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
            expect(Localization.shared.fineTemplateRepetition.item.minute.name.value()).toBeEqual('Minute');
            expect(Localization.shared.fineTemplateRepetition.item.minute.withCount.value(1)).toBeEqual('1 Minute');
            expect(Localization.shared.fineTemplateRepetition.item.minute.withCount.value(4)).toBeEqual('4 Minuten');
            expect(Localization.shared.fineTemplateRepetition.item.minute.withoutCount.value(1)).toBeEqual('Minute');
            expect(Localization.shared.fineTemplateRepetition.item.minute.withoutCount.value(4)).toBeEqual('Minuten');
        });

        it('fineTemplateRepetition.item.minute should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('minute')).toBeEqual('Minute');
            expect(new FineTemplateRepetition('minute', null).formatted(1)).toBeEqual('1 Minute');
            expect(new FineTemplateRepetition('minute', null).formatted(4)).toBeEqual('4 Minuten');
            expect(new FineTemplateRepetition('minute', null).formattedWithoutCount(1)).toBeEqual('Minute');
            expect(new FineTemplateRepetition('minute', null).formattedWithoutCount(4)).toBeEqual('Minuten');
        });

        it('fineTemplateRepetition.item.day should be tested', () => {
            expect(Localization.shared.fineTemplateRepetition.item.day.name.value()).toBeEqual('Tag');
            expect(Localization.shared.fineTemplateRepetition.item.day.withCount.value(1)).toBeEqual('1 Tag');
            expect(Localization.shared.fineTemplateRepetition.item.day.withCount.value(4)).toBeEqual('4 Tage');
            expect(Localization.shared.fineTemplateRepetition.item.day.withoutCount.value(1)).toBeEqual('Tag');
            expect(Localization.shared.fineTemplateRepetition.item.day.withoutCount.value(4)).toBeEqual('Tage');
        });

        it('fineTemplateRepetition.item.day should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('day')).toBeEqual('Tag');
            expect(new FineTemplateRepetition('day', null).formatted(1)).toBeEqual('1 Tag');
            expect(new FineTemplateRepetition('day', null).formatted(4)).toBeEqual('4 Tage');
            expect(new FineTemplateRepetition('day', null).formattedWithoutCount(1)).toBeEqual('Tag');
            expect(new FineTemplateRepetition('day', null).formattedWithoutCount(4)).toBeEqual('Tage');
        });

        it('fineTemplateRepetition.item.item should be tested', () => {
            expect(Localization.shared.fineTemplateRepetition.item.item.name.value()).toBeEqual('Teil');
            expect(Localization.shared.fineTemplateRepetition.item.item.withCount.value(1)).toBeEqual('1 Teil');
            expect(Localization.shared.fineTemplateRepetition.item.item.withCount.value(4)).toBeEqual('4 Teile');
            expect(Localization.shared.fineTemplateRepetition.item.item.withoutCount.value(1)).toBeEqual('Teil');
            expect(Localization.shared.fineTemplateRepetition.item.item.withoutCount.value(4)).toBeEqual('Teile');
        });

        it('fineTemplateRepetition.item.item should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('item')).toBeEqual('Teil');
            expect(new FineTemplateRepetition('item', null).formatted(1)).toBeEqual('1 Teil');
            expect(new FineTemplateRepetition('item', null).formatted(4)).toBeEqual('4 Teile');
            expect(new FineTemplateRepetition('item', null).formattedWithoutCount(1)).toBeEqual('Teil');
            expect(new FineTemplateRepetition('item', null).formattedWithoutCount(4)).toBeEqual('Teile');
        });

        it('fineTemplateRepetition.item.count should be tested', () => {
            expect(Localization.shared.fineTemplateRepetition.item.count.name.value()).toBeEqual('Anzahl');
            expect(Localization.shared.fineTemplateRepetition.item.count.withCount.value(1)).toBeEqual('1 mal');
            expect(Localization.shared.fineTemplateRepetition.item.count.withCount.value(4)).toBeEqual('4 mal');
            expect(Localization.shared.fineTemplateRepetition.item.count.withoutCount.value(1)).toBeEqual('mal');
            expect(Localization.shared.fineTemplateRepetition.item.count.withoutCount.value(4)).toBeEqual('mal');
        });

        it('fineTemplateRepetition.item.count should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('count')).toBeEqual('Anzahl');
            expect(new FineTemplateRepetition('count', null).formatted(1)).toBeEqual('1 mal');
            expect(new FineTemplateRepetition('count', null).formatted(4)).toBeEqual('4 mal');
            expect(new FineTemplateRepetition('count', null).formattedWithoutCount(1)).toBeEqual('mal');
            expect(new FineTemplateRepetition('count', null).formattedWithoutCount(4)).toBeEqual('mal');
        });
    });

    describe('payedState should be tested', () => {

        it('payedState.payed should be tested', () => {
            expect(Localization.shared.payedState.payed.value()).toBeEqual('Bezahlt');
        });

        it('payedState.payed should be formatted correctly', () => {
            expect(PayedState.formatted('payed')).toBeEqual('Bezahlt');
        });

        it('payedState.notPayed should be tested', () => {
            expect(Localization.shared.payedState.notPayed.value()).toBeEqual('Offen');
        });

        it('payedState.notPayed should be formatted correctly', () => {
            expect(PayedState.formatted('notPayed')).toBeEqual('Offen');
        });
    });

    describe('userRole should be tested', () => {

        it('userRole.personManager should be tested', () => {
            expect(Localization.shared.userRole.personManager.value()).toBeEqual('Personenmanager');
        });

        it('userRole.personManager should be formatted correctly', () => {
            expect(UserRole.formatted('person-manager')).toBeEqual('Personenmanager');
        });

        it('userRole.fineTemplateManager should be tested', () => {
            expect(Localization.shared.userRole.fineTemplateManager.value()).toBeEqual('Strafvorlagenmanager');
        });

        it('userRole.fineTemplateManager should be formatted correctly', () => {
            expect(UserRole.formatted('fineTemplate-manager')).toBeEqual('Strafvorlagenmanager');
        });

        it('userRole.fineManager should be tested', () => {
            expect(Localization.shared.userRole.fineManager.value()).toBeEqual('Strafenmanager');
        });

        it('userRole.fineManager should be formatted correctly', () => {
            expect(UserRole.formatted('fine-manager')).toBeEqual('Strafenmanager');
        });

        it('userRole.teamManager should be tested', () => {
            expect(Localization.shared.userRole.teamManager.value()).toBeEqual('Teammanager');
        });

        it('userRole.teamManager should be formatted correctly', () => {
            expect(UserRole.formatted('team-manager')).toBeEqual('Teammanager');
        });
    });
});
