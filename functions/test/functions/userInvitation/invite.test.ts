import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';
import { UserInvitation } from '@stevenkellner/team-conduct-api';

describe('UserInvitationInviteFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('person not found', async () => {
        const result = await FirebaseApp.shared.functions.userInvitation.invite.executeWithResult(new UserInvitation(
            FirebaseApp.shared.testTeam.id,
            RandomData.shared.personId()
        ));
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Person not found')));
    });

    it('person already has an account', async () => {
        const result = await FirebaseApp.shared.functions.userInvitation.invite.executeWithResult(new UserInvitation(
            FirebaseApp.shared.testTeam.id,
            FirebaseApp.shared.testTeam.persons[0].id
        ));
        expect(result).toBeEqual(Result.failure(new FunctionsError('already-exists', 'Person already has an account')));
    });

    it('should invite', async () => {
        const invitation = new UserInvitation(
            FirebaseApp.shared.testTeam.id,
            FirebaseApp.shared.testTeam.persons[1].id
        );
        const invitationId = await FirebaseApp.shared.functions.userInvitation.invite.execute(invitation);
        expect(invitationId).toBeEqual(invitation.createId());
        const invitationSnapshot = await FirebaseApp.shared.firestore.userInvitation(invitationId).snapshot();
        expect(invitationSnapshot.exists).toBeTrue();
        expect(invitationSnapshot.data).toBeEqual({
            teamId: FirebaseApp.shared.testTeam.id.guidString,
            personId: FirebaseApp.shared.testTeam.persons[1].id.guidString
        });
    });
});
