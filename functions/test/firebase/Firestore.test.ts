import { expect } from '@assertive-ts/core';
import { Firestore } from '../../src/firebase/Firestore';

describe('Firestore', () => {
    describe('shared singleton', () => {
        it('should return the same instance on multiple calls', () => {
            const instance1 = Firestore.shared;
            const instance2 = Firestore.shared;

            expect(instance1).toBe(instance2);
        });

        it('should create an instance', () => {
            const instance = Firestore.shared;

            expect(instance).toBeInstanceOf(Firestore);
        });
    });

    describe('accessor methods', () => {
        it('should have team method', () => {
            expect(typeof Firestore.shared.team).toBeEqual('function');
        });

        it('should have user method', () => {
            expect(typeof Firestore.shared.user).toBeEqual('function');
        });

        it('should have invitation method', () => {
            expect(typeof Firestore.shared.invitation).toBeEqual('function');
        });

        it('should have persons method', () => {
            expect(typeof Firestore.shared.persons).toBeEqual('function');
        });

        it('should have person method', () => {
            expect(typeof Firestore.shared.person).toBeEqual('function');
        });

        it('should have fineTemplates method', () => {
            expect(typeof Firestore.shared.fineTemplates).toBeEqual('function');
        });

        it('should have fineTemplate method', () => {
            expect(typeof Firestore.shared.fineTemplate).toBeEqual('function');
        });

        it('should have fines method', () => {
            expect(typeof Firestore.shared.fines).toBeEqual('function');
        });

        it('should have fine method', () => {
            expect(typeof Firestore.shared.fine).toBeEqual('function');
        });
    });
});
