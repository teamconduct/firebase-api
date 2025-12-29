import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';
import { User, UserRole } from '@stevenkellner/team-conduct-api';

describe('TeamNewFunction', () => {

    const userId = RandomData.shared.userId();

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam();
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('should throw an error if user is not authenticated', async () => {
        await FirebaseApp.shared.auth.signOut();
        const result = await FirebaseApp.shared.functions.team.new.executeWithResult({
            id: RandomData.shared.teamId(),
            name: RandomData.shared.teamName(),
            personId: RandomData.shared.personId(),
            personProperties: RandomData.shared.personProperties(),
            signInType: new User.SignInTypeOAuth('google')
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('permission-denied', 'User is not authenticated')));
    });

    it('should throw an error if team already exists', async () => {
        const result = await FirebaseApp.shared.functions.team.new.executeWithResult({
            id: FirebaseApp.shared.testTeam.id,
            name: RandomData.shared.teamName(),
            personId: RandomData.shared.personId(),
            personProperties: RandomData.shared.personProperties(),
            signInType: new User.SignInTypeOAuth('google')
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'Team already exists')));
    });

    it('should create a new team existing user', async () => {
        const teamId = RandomData.shared.teamId();
        const teamName = RandomData.shared.teamName();
        const personId = RandomData.shared.personId();
        const personProperties = RandomData.shared.personProperties();
        const user = await FirebaseApp.shared.functions.team.new.execute({
            id: teamId,
            name: teamName,
            personId: personId,
            personProperties: personProperties,
            signInType: new User.SignInTypeOAuth('google')
        });
        expect(user.teams.has(teamId)).toBeTrue();
        expect(user.teams.get(teamId)).toBeEqual(new User.TeamProperties(teamId, teamName, personId));
        const userSnpapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(userSnpapshot.exists).toBeTrue();
        expect(teamId.guidString in userSnpapshot.data.teams).toBeTrue();
        const userTeam = userSnpapshot.data.teams[teamId.guidString];
        expect(userTeam).toBeEqual({
            teamId: teamId.guidString,
            teamName: teamName,
            personId: personId.guidString
        });
        const teamSnapshot = await FirebaseApp.shared.firestore.team(teamId).snapshot();
        expect(teamSnapshot.exists).toBeTrue();
        expect(teamSnapshot.data).toBeEqual({
            id: teamId.guidString,
            name: teamName,
            paypalMeLink: null
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(teamId, personId).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.signInProperties !== null).toBeTrue();
        expect(personSnapshot.data).toBeEqual({
            id: personId.guidString,
            properties: personProperties.flatten,
            fineIds: [],
            signInProperties: {
                userId: userId.value,
                joinDate: personSnapshot.data.signInProperties!.joinDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                },
                roles: [...UserRole.all]
            }
        });
    });

    it('should create a new team not exiting user', async () => {
        const teamId = RandomData.shared.teamId();
        const teamName = RandomData.shared.teamName();
        const personId = RandomData.shared.personId();
        const personProperties = RandomData.shared.personProperties();
        await FirebaseApp.shared.firestore.user(userId).remove();
        const user = await FirebaseApp.shared.functions.team.new.execute({
            id: teamId,
            name: teamName,
            personId: personId,
            personProperties: personProperties,
            signInType: new User.SignInTypeOAuth('google')
        });
        expect(user.teams.has(teamId)).toBeTrue();
        expect(user.teams.get(teamId)).toBeEqual(new User.TeamProperties(teamId, teamName, personId));
        const userSnpapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(userSnpapshot.exists).toBeTrue();
        expect(teamId.guidString in userSnpapshot.data.teams).toBeTrue();
        const userTeam = userSnpapshot.data.teams[teamId.guidString];
        expect(userTeam).toBeEqual({
            teamId: teamId.guidString,
            teamName: teamName,
            personId: personId.guidString
        });
        const teamSnapshot = await FirebaseApp.shared.firestore.team(teamId).snapshot();
        expect(teamSnapshot.exists).toBeTrue();
        expect(teamSnapshot.data).toBeEqual({
            id: teamId.guidString,
            name: teamName,
            paypalMeLink: null
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(teamId, personId).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.signInProperties !== null).toBeTrue();
        expect(personSnapshot.data).toBeEqual({
            id: personId.guidString,
            properties: personProperties.flatten,
            fineIds: [],
            signInProperties: {
                userId: userId.value,
                joinDate: personSnapshot.data.signInProperties!.joinDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                },
                roles: [...UserRole.all]
            }
        });
    });
});
