import { expect } from '@assertive-ts/core';
import { FineAmount, FineTemplateRepetition, Localization, PayedState, UserRole } from '../../src/types';

describe('Localization for en', () => {

    const locale = 'en';
    const localization = Localization.shared(locale);

    describe('notification.fine should be tested', () => {

        it('notification.fine.new should be tested', () => {
            expect(localization.notification.fine.new.title.value({ reason: 'fine-reason' })).toBeEqual('fine-reason');
            expect(localization.notification.fine.new.body.value({ amount: '10.50 €' })).toBeEqual('You have a new fine of 10.50 €. Please pay it as soon as possible.');
        });

        it('notification.fine.reminder should be tested', () => {
            expect(localization.notification.fine.reminder.title.value()).toBeEqual('You still have outstanding fines');
            expect(localization.notification.fine.reminder.body.value({ amount: '10.50 €' })).toBeEqual('You still have 10.50 € outstanding. Please pay as soon as possible.');
        });

        it('notification.fine.stateChange should be tested', () => {
            expect(localization.notification.fine.stateChange.title.value()).toBeEqual('One of your fines has changed');
            expect(localization.notification.fine.stateChange.bodyPayed.value({ amount: '10.50 €', reason: 'fine-reason' })).toBeEqual('You have paid a fine of 10.50 € (fine-reason).');
            expect(localization.notification.fine.stateChange.bodyUnpayed.value({ amount: '10.50 €', reason: 'fine-reason' })).toBeEqual('fine-reason, 10.50 € is still outstanding.');
            expect(localization.notification.fine.stateChange.bodyDeleted.value({ amount: '10.50 €', reason: 'fine-reason' })).toBeEqual('fine-reason, 10.50 € has been deleted.');
        });
    });

    describe('fineAmount should be tested', () => {

        it('fineAmount.item.type.crateOfBeer should be tested', () => {
            expect(localization.fineAmount.item.type.crateOfBeer.name.value()).toBeEqual('Crate of Beer');
            expect(localization.fineAmount.item.type.crateOfBeer.withCount.value(1)).toBeEqual('a crate of beer');
            expect(localization.fineAmount.item.type.crateOfBeer.withCount.value(4)).toBeEqual('4 crates of beer');
            expect(localization.fineAmount.item.type.crateOfBeer.withoutCount.value(1)).toBeEqual('Crate of Beer');
            expect(localization.fineAmount.item.type.crateOfBeer.withoutCount.value(4)).toBeEqual('Crates of Beer');
        });

        it('fineAmount.item.type.crateOfBeer should be formatted correctly', () => {
            expect(FineAmount.Item.Type.formatted('crateOfBeer', locale)).toBeEqual('Crate of Beer');
            expect(new FineAmount.Item('crateOfBeer', 1).formatted(locale)).toBeEqual('a crate of beer');
            expect(new FineAmount.Item('crateOfBeer', 4).formatted(locale)).toBeEqual('4 crates of beer');
            expect(new FineAmount.Item('crateOfBeer', 1).formattedWithoutCount(locale)).toBeEqual('Crate of Beer');
            expect(new FineAmount.Item('crateOfBeer', 4).formattedWithoutCount(locale)).toBeEqual('Crates of Beer');
        });
    });

    describe('fineTemplateRepetition should be tested', () => {

        it('fineTemplateRepetition.item.minute should be tested', () => {
            expect(localization.fineTemplateRepetition.item.minute.name.value()).toBeEqual('Minute');
            expect(localization.fineTemplateRepetition.item.minute.withCount.value(1)).toBeEqual('1 minute');
            expect(localization.fineTemplateRepetition.item.minute.withCount.value(4)).toBeEqual('4 minutes');
            expect(localization.fineTemplateRepetition.item.minute.withoutCount.value(1)).toBeEqual('minute');
            expect(localization.fineTemplateRepetition.item.minute.withoutCount.value(4)).toBeEqual('minutes');
        });

        it('fineTemplateRepetition.item.minute should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('minute', locale)).toBeEqual('Minute');
            expect(new FineTemplateRepetition('minute', null).formatted(1, locale)).toBeEqual('1 minute');
            expect(new FineTemplateRepetition('minute', null).formatted(4, locale)).toBeEqual('4 minutes');
            expect(new FineTemplateRepetition('minute', null).formattedWithoutCount(1, locale)).toBeEqual('minute');
            expect(new FineTemplateRepetition('minute', null).formattedWithoutCount(4, locale)).toBeEqual('minutes');
        });

        it('fineTemplateRepetition.item.day should be tested', () => {
            expect(localization.fineTemplateRepetition.item.day.name.value()).toBeEqual('Day');
            expect(localization.fineTemplateRepetition.item.day.withCount.value(1)).toBeEqual('1 day');
            expect(localization.fineTemplateRepetition.item.day.withCount.value(4)).toBeEqual('4 days');
            expect(localization.fineTemplateRepetition.item.day.withoutCount.value(1)).toBeEqual('day');
            expect(localization.fineTemplateRepetition.item.day.withoutCount.value(4)).toBeEqual('days');
        });

        it('fineTemplateRepetition.item.day should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('day', locale)).toBeEqual('Day');
            expect(new FineTemplateRepetition('day', null).formatted(1, locale)).toBeEqual('1 day');
            expect(new FineTemplateRepetition('day', null).formatted(4, locale)).toBeEqual('4 days');
            expect(new FineTemplateRepetition('day', null).formattedWithoutCount(1, locale)).toBeEqual('day');
            expect(new FineTemplateRepetition('day', null).formattedWithoutCount(4, locale)).toBeEqual('days');
        });

        it('fineTemplateRepetition.item.item should be tested', () => {
            expect(localization.fineTemplateRepetition.item.item.name.value()).toBeEqual('Item');
            expect(localization.fineTemplateRepetition.item.item.withCount.value(1)).toBeEqual('1 item');
            expect(localization.fineTemplateRepetition.item.item.withCount.value(4)).toBeEqual('4 items');
            expect(localization.fineTemplateRepetition.item.item.withoutCount.value(1)).toBeEqual('item');
            expect(localization.fineTemplateRepetition.item.item.withoutCount.value(4)).toBeEqual('items');
        });

        it('fineTemplateRepetition.item.item should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('item', locale)).toBeEqual('Item');
            expect(new FineTemplateRepetition('item', null).formatted(1, locale)).toBeEqual('1 item');
            expect(new FineTemplateRepetition('item', null).formatted(4, locale)).toBeEqual('4 items');
            expect(new FineTemplateRepetition('item', null).formattedWithoutCount(1, locale)).toBeEqual('item');
            expect(new FineTemplateRepetition('item', null).formattedWithoutCount(4, locale)).toBeEqual('items');
        });

        it('fineTemplateRepetition.item.count should be tested', () => {
            expect(localization.fineTemplateRepetition.item.count.name.value()).toBeEqual('Count');
            expect(localization.fineTemplateRepetition.item.count.withCount.value(1)).toBeEqual('1 time');
            expect(localization.fineTemplateRepetition.item.count.withCount.value(4)).toBeEqual('4 times');
            expect(localization.fineTemplateRepetition.item.count.withoutCount.value(1)).toBeEqual('time');
            expect(localization.fineTemplateRepetition.item.count.withoutCount.value(4)).toBeEqual('times');
        });

        it('fineTemplateRepetition.item.count should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('count', locale)).toBeEqual('Count');
            expect(new FineTemplateRepetition('count', null).formatted(1, locale)).toBeEqual('1 time');
            expect(new FineTemplateRepetition('count', null).formatted(4, locale)).toBeEqual('4 times');
            expect(new FineTemplateRepetition('count', null).formattedWithoutCount(1, locale)).toBeEqual('time');
            expect(new FineTemplateRepetition('count', null).formattedWithoutCount(4, locale)).toBeEqual('times');
        });
    });

    describe('payedState should be tested', () => {

        it('payedState.payed should be tested', () => {
            expect(localization.payedState.payed.value()).toBeEqual('Paid');
        });

        it('payedState.payed should be formatted correctly', () => {
            expect(PayedState.formatted('payed', locale)).toBeEqual('Paid');
        });

        it('payedState.notPayed should be tested', () => {
            expect(localization.payedState.notPayed.value()).toBeEqual('Outstanding');
        });

        it('payedState.notPayed should be formatted correctly', () => {
            expect(PayedState.formatted('notPayed', locale)).toBeEqual('Outstanding');
        });
    });

    describe('userRole should be tested', () => {

        it('userRole.personManager should be tested', () => {
            expect(localization.userRole.personManager.value()).toBeEqual('Person Manager');
        });

        it('userRole.personManager should be formatted correctly', () => {
            expect(UserRole.formatted('person-manager', locale)).toBeEqual('Person Manager');
        });

        it('userRole.fineTemplateManager should be tested', () => {
            expect(localization.userRole.fineTemplateManager.value()).toBeEqual('Fine Template Manager');
        });

        it('userRole.fineTemplateManager should be formatted correctly', () => {
            expect(UserRole.formatted('fineTemplate-manager', locale)).toBeEqual('Fine Template Manager');
        });

        it('userRole.fineManager should be tested', () => {
            expect(localization.userRole.fineManager.value()).toBeEqual('Fine Manager');
        });

        it('userRole.fineManager should be formatted correctly', () => {
            expect(UserRole.formatted('fine-manager', locale)).toBeEqual('Fine Manager');
        });

        it('userRole.fineCanAdd should be tested', () => {
            expect(localization.userRole.fineCanAdd.value()).toBeEqual('Can add fines');
        });

        it('userRole.fineCanAdd should be formatted correctly', () => {
            expect(UserRole.formatted('fine-can-add', locale)).toBeEqual('Can add fines');
        });

        it('userRole.teamManager should be tested', () => {
            expect(localization.userRole.teamManager.value()).toBeEqual('Team Manager');
        });

        it('userRole.teamManager should be formatted correctly', () => {
            expect(UserRole.formatted('team-manager', locale)).toBeEqual('Team Manager');
        });
    });
});
