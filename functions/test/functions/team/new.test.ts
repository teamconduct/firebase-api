import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { UserAuthId } from '@stevenkellner/firebase-function';
import { User, Team, Person } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('team/new', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.team.new.execute({
                    id: RandomData.shared.teamId(),
                    teamPersonId: RandomData.shared.personId(),
                    name: 'New Team',
                    logoUrl: null,
                    sportCategory: null,
                    description: null,
                    paypalMeLink: null,
                    currency: 'EUR',
                    locale: 'en'
                }),
                'unauthenticated',
                'User is not authenticated'
            );
        });
    });

    describe('given the user has no Firestore auth record', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.auth.signIn();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.team.new.execute({
                    id: RandomData.shared.teamId(),
                    teamPersonId: RandomData.shared.personId(),
                    name: 'New Team',
                    logoUrl: null,
                    sportCategory: null,
                    description: null,
                    paypalMeLink: null,
                    currency: 'EUR',
                    locale: 'en'
                }),
                'permission-denied',
                'User authentication does not exist'
            );
        });
    });

    describe('given the user document does not exist', () => {
        it('should throw a not-found error', async () => {
            const authId = await FirebaseApp.shared.auth.signIn();
            await FirebaseApp.shared.firestore.userAuth(authId).set({ userId: RandomData.shared.userId() });

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.team.new.execute({
                    id: RandomData.shared.teamId(),
                    teamPersonId: RandomData.shared.personId(),
                    name: 'New Team',
                    logoUrl: null,
                    sportCategory: null,
                    description: null,
                    paypalMeLink: null,
                    currency: 'EUR',
                    locale: 'en'
                }),
                'not-found',
                'User does not exist'
            );
        });
    });

    describe('given a valid authenticated user', () => {
        let testUserAuthId: UserAuthId;
        let newTeamId: Team.Id;
        let newPersonId: Person.Id;

        beforeEach(async () => {
            testUserAuthId = await FirebaseApp.shared.addTestTeam('team-manager');
            newTeamId = RandomData.shared.teamId();
            newPersonId = RandomData.shared.personId();
        });

        it('should create the team document in Firestore', async () => {
            await FirebaseApp.shared.functions.team.new.execute({
                id: newTeamId,
                teamPersonId: newPersonId,
                name: 'Brand New Team',
                logoUrl: null,
                sportCategory: 'Football',
                description: 'A great team',
                paypalMeLink: null,
                currency: 'EUR',
                locale: 'de'
            });

            const teamSnapshot = await FirebaseApp.shared.firestore.team(newTeamId).snapshot();
            expect(teamSnapshot.exists).toBeTrue();

            const team = Team.builder.build(teamSnapshot.data);
            expect(team.name).toBeEqual('Brand New Team');
            expect(team.settings.currency).toBeEqual('EUR');
            expect(team.settings.locale).toBeEqual('de');
        });

        it('should create the initial person document in Firestore', async () => {
            await FirebaseApp.shared.functions.team.new.execute({
                id: newTeamId,
                teamPersonId: newPersonId,
                name: 'Brand New Team',
                logoUrl: null,
                sportCategory: null,
                description: null,
                paypalMeLink: null,
                currency: 'USD',
                locale: 'en'
            });

            const personSnapshot = await FirebaseApp.shared.firestore.person(newTeamId, newPersonId).snapshot();
            expect(personSnapshot.exists).toBeTrue();

            const person = Person.builder.build(personSnapshot.data);
            expect(person.signInProperties).not.toBeNull();
        });

        it('should add the new team to the user\'s teams dictionary', async () => {
            await FirebaseApp.shared.functions.team.new.execute({
                id: newTeamId,
                teamPersonId: newPersonId,
                name: 'Added Team',
                logoUrl: null,
                sportCategory: null,
                description: null,
                paypalMeLink: null,
                currency: 'USD',
                locale: 'en'
            });

            const userAuthSnapshot = await FirebaseApp.shared.firestore.userAuth(testUserAuthId).snapshot();
            const linkedUserId = User.Id.builder.build(userAuthSnapshot.data.userId);
            const userSnapshot = await FirebaseApp.shared.firestore.user(linkedUserId).snapshot();
            const user = User.builder.build(userSnapshot.data);

            expect(user.teams.has(newTeamId)).toBeTrue();
        });
    });
});

