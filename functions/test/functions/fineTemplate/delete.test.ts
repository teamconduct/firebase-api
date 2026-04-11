import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('fineTemplate/delete', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fineTemplate.delete.execute({
                    teamId: RandomData.shared.teamId(),
                    id: RandomData.shared.fineTemplateId()
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the required role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('fine-can-add');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fineTemplate.delete.execute({
                    teamId: testTeam.id,
                    id: RandomData.shared.fineTemplateId()
                }),
                'permission-denied'
            );
        });
    });

    describe('given the fine template does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fineTemplate.delete.execute({
                    teamId: testTeam.id,
                    id: RandomData.shared.fineTemplateId()
                }),
                'not-found',
                'FineTemplate not found'
            );
        });
    });

    describe('given a valid team-manager and an existing template', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should delete the fine template from Firestore', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const targetTemplate = testTeam.fineTemplates[0];

            await FirebaseApp.shared.functions.fineTemplate.delete.execute({
                teamId: testTeam.id,
                id: targetTemplate.id
            });

            const snapshot = await FirebaseApp.shared.firestore.fineTemplate(testTeam.id, targetTemplate.id).snapshot();
            expect(snapshot.exists).toBeFalse();
        });
    });
});
