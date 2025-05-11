
import { expect } from '@assertive-ts/core';
import { FirebaseApp } from './FirebaseApp/FirebaseApp';

describe('Test', () => {
    it('add two numbers', async () => {
        await FirebaseApp.shared.addTestTeam();
        expect(3 + 4).toBeEqual(7);
    });
});
