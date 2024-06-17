import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';
import { Guid } from 'firebase-function';

describe('UserRoleEditFunction', () => {

    let userId: string;

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
            userId: 'non-existent',
            teamId: testTeam.id,
            roles: ['userRole-manager']
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('user is not in team', async () => {
        await FirebaseApp.shared.firestore.collection('users').document('asdf').set({
            teams: {
                [Guid.generate().guidString]: {
                    personId: Guid.generate(),
                    roles: ['fine-add']
                }
            }
        });
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            userId: 'asdf',
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
        const userSnapshot = await FirebaseApp.shared.firestore.collection('users').document(userId).snapshot();
        expect(userSnapshot.exists).to.be.equal(true);
        expect(userSnapshot.data.teams[testTeam.id.guidString].roles).to.be.deep.equal(['userRole-manager', 'fine-delete', 'person-add']);
    });
});
