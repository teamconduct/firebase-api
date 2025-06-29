import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';
import { Invitation } from '@stevenkellner/team-conduct-api';

describe('InvitationInviteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person not found', async () => {
        const result = await FirebaseApp.shared.functions.invitation.invite.executeWithResult(new Invitation(
            FirebaseApp.shared.testTeam.id,
            RandomData.shared.personId()
        ));
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('person already has an account', async () => {
        const result = await FirebaseApp.shared.functions.invitation.invite.executeWithResult(new Invitation(
            FirebaseApp.shared.testTeam.id,
            FirebaseApp.shared.testTeam.persons[0].id
        ));
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'Person already has an account')));
    });

    it('should invite person', async () => {
        const person = FirebaseApp.shared.testTeam.persons[1];
        person.signInProperties = null;
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, person.id).set(person);
        const invitation = new Invitation(FirebaseApp.shared.testTeam.id, person.id);
        const invitationId = await FirebaseApp.shared.functions.invitation.invite.execute(invitation);
        expect(invitationId).toBeEqual(invitation.createId());
        const invitationSnapshot = await FirebaseApp.shared.firestore.invitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeTrue();
        expect(invitationSnapshot.data).toBeEqual({
            teamId: FirebaseApp.shared.testTeam.id.guidString,
            personId: person.id.guidString
        });
    });

    it('should invite team', async () => {
        const invitation = new Invitation(FirebaseApp.shared.testTeam.id, null);
        const invitationId = await FirebaseApp.shared.functions.invitation.invite.execute(invitation);
        expect(invitationId).toBeEqual(invitation.createId());
        const invitationSnapshot = await FirebaseApp.shared.firestore.invitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeTrue();
        expect(invitationSnapshot.data).toBeEqual({
            teamId: FirebaseApp.shared.testTeam.id.guidString,
            personId: null
        });
    });
});
