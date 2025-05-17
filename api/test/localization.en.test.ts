import { expect } from '@assertive-ts/core';
import * as localizationEN from '../src/locales/en.json';
import { FineAmount, FineTemplateRepetition, Localization, PayedState, UserRole } from '../src/types';
import { localizationWithoutDefault, TestedKeys } from './localization-utils';

describe('Localization for en', () => {

    const testedKeys = new TestedKeys(localizationWithoutDefault(localizationEN));

    before(() => {
        Localization.shared.setLocale('en');
    });

    after('all values should be tested', () => {
        testedKeys.checkAllTested();
    });

    describe('notification.fine should be tested', () => {

        it('notification.fine.new should be tested', () => {
            testedKeys.testArgs(key => key.notification.fine.new.title, ['fine-reason'], 'fine-reason');
            testedKeys.testArgs(key => key.notification.fine.new.body, ['10.50 €'], 'You have a new fine of 10.50 €. Please pay it as soon as possible.');
        });

        it('notification.fine.reminder should be tested', () => {
            testedKeys.test(key => key.notification.fine.reminder.title, 'You still have outstanding fines');
            testedKeys.testArgs(key => key.notification.fine.reminder.body, ['10.50 €'], 'You still have 10.50 € outstanding. Please pay as soon as possible.');
        });

        it('notification.fine.stateChange should be tested', () => {
            testedKeys.test(key => key.notification.fine.stateChange.title, 'One of your fines has changed');
            testedKeys.testArgs(key => key.notification.fine.stateChange.bodyPayed, ['10.50 €', 'fine-reason'], 'You have paid a fine of 10.50 € (fine-reason).');
            testedKeys.testArgs(key => key.notification.fine.stateChange.bodyUnpayed, ['10.50 €', 'fine-reason'], '10.50 €, fine-reason is still outstanding.');
            testedKeys.testArgs(key => key.notification.fine.stateChange.bodyDeleted, ['10.50 €', 'fine-reason'], '10.50 €, fine-reason has been deleted.');
        });
    });

    describe('fineAmount should be tested', () => {

        it('fineAmount.item.type.crateOfBeer should be tested', () => {
            testedKeys.test(key => key.fineAmount.item.type.crateOfBeer, 'Crate of Beer');
            testedKeys.testN(key => key.fineAmount.item.type.crateOfBeer, 1, 'a crate of beer');
            testedKeys.testN(key => key.fineAmount.item.type.crateOfBeer, 4, '4 crates of beer');
        });

        it('fineAmount.item.type.crateOfBeer should be formatted correctly', () => {
            expect(FineAmount.Item.Type.formatted('crateOfBeer')).toBeEqual('Crate of Beer');
            expect(new FineAmount.Item('crateOfBeer', 1).formatted()).toBeEqual('a crate of beer');
            expect(new FineAmount.Item('crateOfBeer', 4).formatted()).toBeEqual('4 crates of beer');
        });
    });

    describe('fineTemplateRepetition should be tested', () => {

        it('fineTemplateRepetition.item.minute should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.minute, 'Minute');
            testedKeys.testN(key => key.fineTemplateRepetition.item.minute, 1, '1 minute');
            testedKeys.testN(key => key.fineTemplateRepetition.item.minute, 4, '4 minutes');
        });

        it('fineTemplateRepetition.item.minute should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('minute')).toBeEqual('Minute');
            expect(new FineTemplateRepetition('minute', null).formatted(1)).toBeEqual('1 minute');
            expect(new FineTemplateRepetition('minute', null).formatted(4)).toBeEqual('4 minutes');
        });

        it('fineTemplateRepetition.item.day should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.day, 'Day');
            testedKeys.testN(key => key.fineTemplateRepetition.item.day, 1, '1 day');
            testedKeys.testN(key => key.fineTemplateRepetition.item.day, 4, '4 days');
        });

        it('fineTemplateRepetition.item.day should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('day')).toBeEqual('Day');
            expect(new FineTemplateRepetition('day', null).formatted(1)).toBeEqual('1 day');
            expect(new FineTemplateRepetition('day', null).formatted(4)).toBeEqual('4 days');
        });

        it('fineTemplateRepetition.item.item should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.item, 'Item');
            testedKeys.testN(key => key.fineTemplateRepetition.item.item, 1, '1 item');
            testedKeys.testN(key => key.fineTemplateRepetition.item.item, 4, '4 items');
        });

        it('fineTemplateRepetition.item.item should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('item')).toBeEqual('Item');
            expect(new FineTemplateRepetition('item', null).formatted(1)).toBeEqual('1 item');
            expect(new FineTemplateRepetition('item', null).formatted(4)).toBeEqual('4 items');
        });

        it('fineTemplateRepetition.item.count should be tested', () => {
            testedKeys.test(key => key.fineTemplateRepetition.item.count, 'Count');
            testedKeys.testN(key => key.fineTemplateRepetition.item.count, 1, '1 time');
            testedKeys.testN(key => key.fineTemplateRepetition.item.count, 4, '4 times');
        });

        it('fineTemplateRepetition.item.count should be formatted correctly', () => {
            expect(FineTemplateRepetition.Item.formatted('count')).toBeEqual('Count');
            expect(new FineTemplateRepetition('count', null).formatted(1)).toBeEqual('1 time');
            expect(new FineTemplateRepetition('count', null).formatted(4)).toBeEqual('4 times');
        });
    });

    describe('payedState should be tested', () => {

        it('payedState.payed should be tested', () => {
            testedKeys.test(key => key.payedState.payed, 'Paid');
        });

        it('payedState.payed should be formatted correctly', () => {
            expect(PayedState.formatted('payed')).toBeEqual('Paid');
        });

        it('payedState.notPayed should be tested', () => {
            testedKeys.test(key => key.payedState.notPayed, 'Outstanding');
        });

        it('payedState.notPayed should be formatted correctly', () => {
            expect(PayedState.formatted('notPayed')).toBeEqual('Outstanding');
        });
    });

    describe('userRole should be tested', () => {

        it('userRole.personManager should be tested', () => {
            testedKeys.test(key => key.userRole.personManager, 'Person Manager');
        });

        it('userRole.personManager should be formatted correctly', () => {
            expect(UserRole.formatted('person-manager')).toBeEqual('Person Manager');
        });

        it('userRole.fineTemplateManager should be tested', () => {
            testedKeys.test(key => key.userRole.fineTemplateManager, 'Fine Template Manager');
        });

        it('userRole.fineTemplateManager should be formatted correctly', () => {
            expect(UserRole.formatted('fineTemplate-manager')).toBeEqual('Fine Template Manager');
        });

        it('userRole.fineManager should be tested', () => {
            testedKeys.test(key => key.userRole.fineManager, 'Fine Manager');
        });

        it('userRole.fineManager should be formatted correctly', () => {
            expect(UserRole.formatted('fine-manager')).toBeEqual('Fine Manager');
        });

        it('userRole.teamManager should be tested', () => {
            testedKeys.test(key => key.userRole.teamManager, 'Team Manager');
        });

        it('userRole.teamManager should be formatted correctly', () => {
            expect(UserRole.formatted('team-manager')).toBeEqual('Team Manager');
        });
    });
});
