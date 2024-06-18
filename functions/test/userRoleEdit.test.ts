import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';
import { Tagged } from 'firebase-function';
import { User, UserId } from '../src/types';
import { Firestore } from '../src/Firestore';

describe('UserRoleEditFunction', () => {

    let userId: UserId;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam('userRole-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('remove userRole-manager role from user', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            userId: userId,
            teamId: testTeam.id,
            roles: []
        });
        await expect(execute).to.awaitThrow('invalid-argument');
    });

    it('user does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            userId: new Tagged('non-existent', 'user'),
            teamId: testTeam.id,
            roles: ['userRole-manager']
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('user is not in team', async () => {
        const user = User.empty();
        user.teams.set(Tagged.generate('team'), {
            personId: Tagged.generate('person'),
            roles: ['fine-add']
        });
        await Firestore.shared.user(new Tagged('asdf', 'user')).set(user);
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            userId: new Tagged('asdf', 'user'),
            teamId: testTeam.id,
            roles: ['userRole-manager']
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('edit user roles', async () => {
        await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            userId: userId,
            teamId: testTeam.id,
            roles: ['userRole-manager', 'fine-delete', 'person-add']
        });
        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        expect(userSnapshot.exists).to.be.equal(true);
        expect(userSnapshot.data.teams[testTeam.id.guidString].roles).to.be.deep.equal(['userRole-manager', 'fine-delete', 'person-add']);
    });
});
