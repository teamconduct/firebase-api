import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';
import { Tagged } from 'firebase-function';
import { Firestore } from '../src/Firestore';
import { assert } from 'chai';

describe('UserRoleEditFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('remove team-manager role from user', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            roles: []
        });
        await expect(execute).to.awaitThrow('invalid-argument');
    });

    it('user does not exist', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            teamId: testTeam.id,
            personId: Tagged.generate('person'),
            roles: ['team-manager']
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('edit user roles', async () => {
        await FirebaseApp.shared.functions.function('user').function('roleEdit').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            roles: ['team-manager', 'fine-manager', 'person-manager']
        });
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[0].id).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties === null).to.be.equal(false);
        assert(personSnapshot.data.signInProperties !== null);
        expect(personSnapshot.data.signInProperties.roles).to.be.deep.equal(['team-manager', 'fine-manager', 'person-manager']);
    });
});
