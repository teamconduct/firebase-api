import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { User, Team, Person, PersonProperties, PersonSignInProperties, NotificationProperties } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('team/update', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.team.update.execute({
                    id: RandomData.shared.teamId(),
                    name: 'do-not-update',
                    logoUrl: 'do-not-update',
                    sportCategory: 'do-not-update',
                    description: 'do-not-update',
                    paypalMeLink: 'do-not-update',
                    allowMembersToAddFines: 'do-not-update',
                    fineVisibility: 'do-not-update',
                    joinRequestType: 'do-not-update',
                    currency: 'do-not-update',
                    locale: 'do-not-update'
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the team-manager role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('person-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.team.update.execute({
                    id: testTeam.id,
                    name: 'do-not-update',
                    logoUrl: 'do-not-update',
                    sportCategory: 'do-not-update',
                    description: 'do-not-update',
                    paypalMeLink: 'do-not-update',
                    allowMembersToAddFines: 'do-not-update',
                    fineVisibility: 'do-not-update',
                    joinRequestType: 'do-not-update',
                    currency: 'do-not-update',
                    locale: 'do-not-update'
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
                () => FirebaseApp.shared.functions.team.update.execute({
                    id: testTeamId,
                    name: 'Updated Name',
                    logoUrl: 'do-not-update',
                    sportCategory: 'do-not-update',
                    description: 'do-not-update',
                    paypalMeLink: 'do-not-update',
                    allowMembersToAddFines: 'do-not-update',
                    fineVisibility: 'do-not-update',
                    joinRequestType: 'do-not-update',
                    currency: 'do-not-update',
                    locale: 'do-not-update'
                }),
                'not-found',
                'Team does not exist'
            );
        });
    });

    describe('given a valid authenticated team-manager', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        describe('when updating the team name', () => {
            it('should update the team name', async () => {
                const testTeam = FirebaseApp.shared.testTeam;

                await FirebaseApp.shared.functions.team.update.execute({
                    id: testTeam.id,
                    name: 'Updated Team Name',
                    logoUrl: 'do-not-update',
                    sportCategory: 'do-not-update',
                    description: 'do-not-update',
                    paypalMeLink: 'do-not-update',
                    allowMembersToAddFines: 'do-not-update',
                    fineVisibility: 'do-not-update',
                    joinRequestType: 'do-not-update',
                    currency: 'do-not-update',
                    locale: 'do-not-update'
                });

                const snapshot = await FirebaseApp.shared.firestore.team(testTeam.id).snapshot();
                const updated = Team.builder.build(snapshot.data);
                expect(updated.name).toBeEqual('Updated Team Name');
            });
        });

        describe('when setting optional fields', () => {
            it('should update logoUrl, sportCategory, description and paypalMeLink', async () => {
                const testTeam = FirebaseApp.shared.testTeam;

                await FirebaseApp.shared.functions.team.update.execute({
                    id: testTeam.id,
                    name: 'do-not-update',
                    logoUrl: 'https://example.com/logo.png',
                    sportCategory: 'Basketball',
                    description: 'Best team',
                    paypalMeLink: 'paypal.me/team',
                    allowMembersToAddFines: 'do-not-update',
                    fineVisibility: 'do-not-update',
                    joinRequestType: 'do-not-update',
                    currency: 'do-not-update',
                    locale: 'do-not-update'
                });

                const snapshot = await FirebaseApp.shared.firestore.team(testTeam.id).snapshot();
                const updated = Team.builder.build(snapshot.data);
                expect(updated.logoUrl).toBeEqual('https://example.com/logo.png');
                expect(updated.sportCategory).toBeEqual('Basketball');
                expect(updated.description).toBeEqual('Best team');
                expect(updated.settings.paypalMeLink).toBeEqual('paypal.me/team');
            });

            it('should remove optional fields when given "remove"', async () => {
                const testTeam = FirebaseApp.shared.testTeam;

                await FirebaseApp.shared.functions.team.update.execute({
                    id: testTeam.id, name: 'do-not-update',
                    logoUrl: 'https://logo.png', sportCategory: 'Football',
                    description: 'A team', paypalMeLink: 'paypal.me/old',
                    allowMembersToAddFines: 'do-not-update', fineVisibility: 'do-not-update',
                    joinRequestType: 'do-not-update', currency: 'do-not-update', locale: 'do-not-update'
                });
                await FirebaseApp.shared.functions.team.update.execute({
                    id: testTeam.id, name: 'do-not-update',
                    logoUrl: 'remove', sportCategory: 'remove',
                    description: 'remove', paypalMeLink: 'remove',
                    allowMembersToAddFines: 'do-not-update', fineVisibility: 'do-not-update',
                    joinRequestType: 'do-not-update', currency: 'do-not-update', locale: 'do-not-update'
                });

                const snapshot = await FirebaseApp.shared.firestore.team(testTeam.id).snapshot();
                const updated = Team.builder.build(snapshot.data);
                expect(updated.logoUrl).toBeNull();
                expect(updated.sportCategory).toBeNull();
                expect(updated.description).toBeNull();
                expect(updated.settings.paypalMeLink).toBeNull();
            });
        });

        describe('when updating settings', () => {
            it('should update currency, locale, fineVisibility and joinRequestType', async () => {
                const testTeam = FirebaseApp.shared.testTeam;

                await FirebaseApp.shared.functions.team.update.execute({
                    id: testTeam.id,
                    name: 'do-not-update',
                    logoUrl: 'do-not-update',
                    sportCategory: 'do-not-update',
                    description: 'do-not-update',
                    paypalMeLink: 'do-not-update',
                    allowMembersToAddFines: false,
                    fineVisibility: 'only-own-fines',
                    joinRequestType: 'invite-only',
                    currency: 'EUR',
                    locale: 'de'
                });

                const snapshot = await FirebaseApp.shared.firestore.team(testTeam.id).snapshot();
                const updated = Team.builder.build(snapshot.data);
                expect(updated.settings.allowMembersToAddFines).toBeFalse();
                expect(updated.settings.fineVisibility).toBeEqual('only-own-fines');
                expect(updated.settings.joinRequestType).toBeEqual('invite-only');
                expect(updated.settings.currency).toBeEqual('EUR');
                expect(updated.settings.locale).toBeEqual('de');
            });
        });
    });
});
