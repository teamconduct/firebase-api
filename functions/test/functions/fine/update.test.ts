import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { User, Person, Fine, Money, PersonProperties, PersonSignInProperties, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('fine/update', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.update.execute({
                    teamId: RandomData.shared.teamId(),
                    personId: RandomData.shared.personId(),
                    fine: RandomData.shared.fine()
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
                () => FirebaseApp.shared.functions.fine.update.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    fine: RandomData.shared.fine()
                }),
                'permission-denied'
            );
        });
    });

    describe('given the team document does not exist', () => {
        it('should throw a not-found error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            const testUserId = RandomData.shared.userId();
            const testTeamId = RandomData.shared.teamId();
            const testPersonId = RandomData.shared.personId();

            await FirebaseApp.shared.firestore.userAuth(authId).set({ userId: testUserId });
            const user = new User(testUserId, UtcDate.now, new User.SignInType.OAuth('google'),
                new User.Properties('J', 'D', null, null), new User.Settings(new NotificationProperties()));
            user.teams.set(testTeamId, new User.TeamProperties(testTeamId, 'Test', testPersonId));
            await FirebaseApp.shared.firestore.user(testUserId).set(user);
            const person = new Person(testPersonId, new PersonProperties('J', 'D'), []);
            person.signInProperties = new PersonSignInProperties(testUserId, UtcDate.now, ['team-manager']);
            await FirebaseApp.shared.firestore.person(testTeamId, testPersonId).set(person);

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.update.execute({
                    teamId: testTeamId,
                    personId: RandomData.shared.personId(),
                    fine: new Fine(RandomData.shared.fineId(), 'notPayed', UtcDate.now, 'Test', Fine.Amount.money(new Money(5, 0)))
                }),
                'not-found',
                'Team not found'
            );
        });
    });

    describe('given the fine does not exist', () => {
        it('should throw a not-found error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.fine.update.execute({
                    teamId: testTeam.id,
                    personId: testTeam.persons[1].id,
                    fine: new Fine(RandomData.shared.fineId(), 'notPayed', UtcDate.now, 'Test', Fine.Amount.money(new Money(5, 0)))
                }),
                'not-found',
                'Fine not found'
            );
        });
    });

    describe('given a valid update', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should persist the updated fine', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const targetFine = testTeam.fines[0];
            const updatedFine = new Fine(targetFine.id, 'notPayed', UtcDate.now, 'Updated Reason', Fine.Amount.money(new Money(20, 0)));
            const personId = testTeam.persons[0].fineIds.some(id => id.guidString === targetFine.id.guidString)
                ? testTeam.persons[0].id
                : testTeam.persons[1].id;

            await FirebaseApp.shared.functions.fine.update.execute({
                teamId: testTeam.id,
                personId: personId,
                fine: updatedFine
            });

            const snapshot = await FirebaseApp.shared.firestore.fine(testTeam.id, targetFine.id).snapshot();
            const stored = Fine.builder.build(snapshot.data);
            expect(stored.reason).toBeEqual('Updated Reason');
        });

        it('should persist payed state change', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const targetFine = testTeam.fines[0];
            const payedFine = new Fine(targetFine.id, 'payed', UtcDate.now, targetFine.reason, targetFine.amount);
            const personId = testTeam.persons[0].fineIds.some(id => id.guidString === targetFine.id.guidString)
                ? testTeam.persons[0].id
                : testTeam.persons[1].id;

            await FirebaseApp.shared.functions.fine.update.execute({
                teamId: testTeam.id,
                personId: personId,
                fine: payedFine
            });

            const snapshot = await FirebaseApp.shared.firestore.fine(testTeam.id, targetFine.id).snapshot();
            const stored = Fine.builder.build(snapshot.data);
            expect(stored.payedState).toBeEqual('payed');
        });
    });
});
