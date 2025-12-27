import { expect } from '@assertive-ts/core';
import { Pluralization } from '../../src/types/Pluralization';

describe('Pluralization', () => {

    describe('Pluralization constructor', () => {

        it('should create pluralization with only other form', () => {
            const plural = new Pluralization({
                other: 'items'
            });

            expect(plural.get(10)).toBeEqual('items');
        });

        it('should create pluralization with all forms', () => {
            const plural = new Pluralization({
                zero: 'no items',
                one: 'one item',
                two: 'two items',
                few: 'few items',
                many: 'many items',
                other: 'some items'
            });

            expect(plural.get(0)).toBeEqual('no items');
        });
    });

    describe('Pluralization.get with zero form', () => {

        it('should return zero form for count = 0', () => {
            const plural = new Pluralization({
                zero: 'no items',
                other: 'items'
            });

            expect(plural.get(0)).toBeEqual('no items');
        });

        it('should return other form for count = 0 when zero not defined', () => {
            const plural = new Pluralization({
                other: 'items'
            });

            expect(plural.get(0)).toBeEqual('items');
        });
    });

    describe('Pluralization.get with one form', () => {

        it('should return one form for count = 1', () => {
            const plural = new Pluralization({
                one: 'one item',
                other: 'items'
            });

            expect(plural.get(1)).toBeEqual('one item');
        });

        it('should return other form for count = 1 when one not defined', () => {
            const plural = new Pluralization({
                other: 'items'
            });

            expect(plural.get(1)).toBeEqual('items');
        });
    });

    describe('Pluralization.get with two form', () => {

        it('should return two form for count = 2', () => {
            const plural = new Pluralization({
                two: 'two items',
                other: 'items'
            });

            expect(plural.get(2)).toBeEqual('two items');
        });

        it('should return other form for count = 2 when two not defined', () => {
            const plural = new Pluralization({
                other: 'items'
            });

            expect(plural.get(2)).toBeEqual('items');
        });
    });

    describe('Pluralization.get with few form', () => {

        it('should return few form for count = 3', () => {
            const plural = new Pluralization({
                few: 'few items',
                other: 'items'
            });

            expect(plural.get(3)).toBeEqual('few items');
        });

        it('should return few form for count = 4', () => {
            const plural = new Pluralization({
                few: 'few items',
                other: 'items'
            });

            expect(plural.get(4)).toBeEqual('few items');
        });

        it('should return other form for count = 3 when few not defined', () => {
            const plural = new Pluralization({
                other: 'items'
            });

            expect(plural.get(3)).toBeEqual('items');
        });

        it('should not use few form for count = 1', () => {
            const plural = new Pluralization({
                few: 'few items',
                other: 'items'
            });

            expect(plural.get(1)).toBeEqual('items');
        });

        it('should use few form for count = 2 when two form not defined', () => {
            const plural = new Pluralization({
                few: 'few items',
                other: 'items'
            });

            expect(plural.get(2)).toBeEqual('few items');
        });

        it('should not use few form for count = 5', () => {
            const plural = new Pluralization({
                few: 'few items',
                other: 'items'
            });

            expect(plural.get(5)).toBeEqual('items');
        });
    });

    describe('Pluralization.get with many form', () => {

        it('should return many form for count = 5', () => {
            const plural = new Pluralization({
                many: 'many items',
                other: 'items'
            });

            expect(plural.get(5)).toBeEqual('many items');
        });

        it('should return many form for count = 10', () => {
            const plural = new Pluralization({
                many: 'many items',
                other: 'items'
            });

            expect(plural.get(10)).toBeEqual('many items');
        });

        it('should return many form for count = 20', () => {
            const plural = new Pluralization({
                many: 'many items',
                other: 'items'
            });

            expect(plural.get(20)).toBeEqual('many items');
        });

        it('should return other form for count = 5 when many not defined', () => {
            const plural = new Pluralization({
                other: 'items'
            });

            expect(plural.get(5)).toBeEqual('items');
        });

        it('should not use many form for count = 4', () => {
            const plural = new Pluralization({
                many: 'many items',
                other: 'items'
            });

            expect(plural.get(4)).toBeEqual('items');
        });

        it('should not use many form for count = 21', () => {
            const plural = new Pluralization({
                many: 'many items',
                other: 'items'
            });

            expect(plural.get(21)).toBeEqual('items');
        });
    });

    describe('Pluralization.get with other form', () => {

        it('should return other form for large count', () => {
            const plural = new Pluralization({
                other: 'items'
            });

            expect(plural.get(100)).toBeEqual('items');
        });

        it('should return other form when no specific form matches', () => {
            const plural = new Pluralization({
                zero: 'no items',
                one: 'one item',
                other: 'items'
            });

            expect(plural.get(50)).toBeEqual('items');
        });
    });

    describe('Pluralization.get with all forms defined', () => {

        it('should select correct form based on priority', () => {
            const plural = new Pluralization({
                zero: 'zero',
                one: 'one',
                two: 'two',
                few: 'few',
                many: 'many',
                other: 'other'
            });

            expect(plural.get(0)).toBeEqual('zero');
            expect(plural.get(1)).toBeEqual('one');
            expect(plural.get(2)).toBeEqual('two');
            expect(plural.get(3)).toBeEqual('few');
            expect(plural.get(4)).toBeEqual('few');
            expect(plural.get(5)).toBeEqual('many');
            expect(plural.get(10)).toBeEqual('many');
            expect(plural.get(20)).toBeEqual('many');
            expect(plural.get(21)).toBeEqual('other');
            expect(plural.get(100)).toBeEqual('other');
        });
    });

    describe('Pluralization.get with template strings', () => {

        it('should handle template-style strings', () => {
            const plural = new Pluralization({
                zero: 'You have no messages',
                one: 'You have {{count}} message',
                other: 'You have {{count}} messages'
            });

            expect(plural.get(0)).toBeEqual('You have no messages');
            expect(plural.get(1)).toBeEqual('You have {{count}} message');
            expect(plural.get(5)).toBeEqual('You have {{count}} messages');
        });
    });
});
