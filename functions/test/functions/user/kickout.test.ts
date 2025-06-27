import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Dictionary, Result, Tagged } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { Team, User } from '@stevenkellner/team-conduct-api';

describe('UserKickoutFunction', () => {

    let userId: User.Id;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('user not found', async () => {
        const result = await FirebaseApp.shared.functions.user.kickout.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            userId: new Tagged('not-found', 'user')
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User not found.')));
    });

    it('not a team member', async () => {
        const userId: User.Id = new Tagged('userId', 'user');
        await FirebaseApp.shared.firestore.user(userId).set(new User(userId));
        const result = await FirebaseApp.shared.functions.user.kickout.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            userId: userId
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User is not a member of the team.')));
    });

    it('kickout self', async () => {
        const result = await FirebaseApp.shared.functions.user.kickout.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            userId: userId
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('invalid-argument', 'You cannot kick yourself out of a team.')));
    });

    it.only('kickout', async () => {
        const userId: User.Id = new Tagged('userId', 'user');
        await FirebaseApp.shared.firestore.user(userId).set(new User(userId, new Dictionary(Team.Id.builder, {
            [FirebaseApp.shared.testTeam.id.guidString]: new User.TeamProperties(FirebaseApp.shared.testTeam.name, FirebaseApp.shared.testTeam.persons[1].id)
        })));
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id).set();
        await FirebaseApp.shared.functions.user.kickout.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            userId: userId
        });
        const userSnapshot = await FirebaseApp.shared.firestore.user(userId).snapshot();
        expect(userSnapshot.exists).toBeTrue();
        expect(userSnapshot.data).toBeEqual();
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[1].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.signInProperties).toBeEqual(null);
    });
});
