import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { FineTemplate } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('fineTemplate/update', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fineTemplate.update.execute({
                    teamId: RandomData.shared.teamId(),
                    fineTemplate: RandomData.shared.fineTemplate()
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
                () => FirebaseApp.shared.functions.fineTemplate.update.execute({
                    teamId: testTeam.id,
                    fineTemplate: RandomData.shared.fineTemplate()
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
                () => FirebaseApp.shared.functions.fineTemplate.update.execute({
                    teamId: testTeam.id,
                    fineTemplate: RandomData.shared.fineTemplate()
                }),
                'not-found',
                'FineTemplate not found'
            );
        });
    });

    describe('given a valid update for an existing template', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should update the fine template document', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const existingTemplate = testTeam.fineTemplates[0];
            const updatedTemplate = RandomData.shared.fineTemplate(existingTemplate.id);

            await FirebaseApp.shared.functions.fineTemplate.update.execute({
                teamId: testTeam.id,
                fineTemplate: updatedTemplate
            });

            const snapshot = await FirebaseApp.shared.firestore.fineTemplate(testTeam.id, existingTemplate.id).snapshot();
            const stored = FineTemplate.builder.build(snapshot.data);
            expect(stored.reason).toBeEqual(updatedTemplate.reason);
            expect(stored.id.guidString).toBeEqual(existingTemplate.id.guidString);
        });
    });
});
