import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';

describe('UserRoleEditFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('remove team-manager role from user', async () => {
        const result = await FirebaseApp.shared.functions.user.roleEdit.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[0].id,
            roles: []
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('unavailable', 'User cannot remove their own team-manager role')));
    });

    it('user does not exist', async () => {
        const result = await FirebaseApp.shared.functions.user.roleEdit.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: RandomData.shared.personId(),
            roles: ['team-manager']
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'User does not exist')));
    });

    it('edit user roles', async () => {
        await FirebaseApp.shared.functions.user.roleEdit.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            personId: FirebaseApp.shared.testTeam.persons[0].id,
            roles: ['team-manager', 'fine-manager', 'person-manager']
        });
        const personSnapshot = await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).toBeTrue();
        expect(personSnapshot.data.signInProperties === null).toBeFalse();
        expect(personSnapshot.data.signInProperties!.roles.length).toBeEqual(3);
        expect(personSnapshot.data.signInProperties!.roles).toContainAll('team-manager', 'fine-manager', 'person-manager');
    });
});
