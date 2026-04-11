import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { FineTemplate } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('fineTemplate/add', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fineTemplate.add.execute({
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
                () => FirebaseApp.shared.functions.fineTemplate.add.execute({
                    teamId: testTeam.id,
                    fineTemplate: RandomData.shared.fineTemplate()
                }),
                'permission-denied'
            );
        });
    });

    describe('given the fine template already exists', () => {
        it('should throw an already-exists error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;
            const existingTemplate = testTeam.fineTemplates[0];

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fineTemplate.add.execute({
                    teamId: testTeam.id,
                    fineTemplate: existingTemplate
                }),
                'already-exists',
                'FineTemplate already exists'
            );
        });
    });

    describe('given a valid team-manager and a new fine template', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should create the fine template document', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const newTemplate = RandomData.shared.fineTemplate();

            await FirebaseApp.shared.functions.fineTemplate.add.execute({
                teamId: testTeam.id,
                fineTemplate: newTemplate
            });

            const snapshot = await FirebaseApp.shared.firestore.fineTemplate(testTeam.id, newTemplate.id).snapshot();
            expect(snapshot.exists).toBeTrue();
            const created = FineTemplate.builder.build(snapshot.data);
            expect(created.reason).toBeEqual(newTemplate.reason);
        });
    });

    describe('given a valid fineTemplate-manager', () => {
        let testUserAuthId: UserAuthId;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('fineTemplate-manager');
        });

        it('should create the fine template using fineTemplate-manager role', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const newTemplate = RandomData.shared.fineTemplate();

            await FirebaseApp.shared.functions.fineTemplate.add.execute({
                teamId: testTeam.id,
                fineTemplate: newTemplate
            });

            const snapshot = await FirebaseApp.shared.firestore.fineTemplate(testTeam.id, newTemplate.id).snapshot();
            expect(snapshot.exists).toBeTrue();
        });
    });
});