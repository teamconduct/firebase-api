import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { RandomData } from '../../utils/RandomData';
import { Invitation, InvitationGetInvitationFunction } from '@stevenkellner/team-conduct-api';

describe('InvitationGetInvitationFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('not signed in', async () => {
        await FirebaseApp.shared.auth.signOut();
        const invitation = new Invitation(
            FirebaseApp.shared.testTeam.id,
            RandomData.shared.personId()
        );
        const result = await FirebaseApp.shared.functions.invitation.getInvitation.executeWithResult(invitation.createId());
        expect(result).toBeEqual(Result.failure(new FunctionsError('unauthenticated', 'User not authenticated')));
    });

    it('invitation not found', async () => {
        const invitation = new Invitation(
            FirebaseApp.shared.testTeam.id,
            RandomData.shared.personId()
        );
        const result = await FirebaseApp.shared.functions.invitation.getInvitation.executeWithResult(invitation.createId());
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Invitation not found')));
    });

    it('team not found', async () => {
        const invitation = new Invitation(
            RandomData.shared.teamId(),
            RandomData.shared.personId()
        );
        const invitationId = invitation.createId();
        await FirebaseApp.shared.firestore.invitation(invitationId).set(invitation);
        const result = await FirebaseApp.shared.functions.invitation.getInvitation.executeWithResult(invitationId);
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Team not found')));
    });

    it('should get invitation for person', async () => {
        const person = FirebaseApp.shared.testTeam.persons[1];
        person.signInProperties = null;
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, person.id).set(person);
        const invitation = new Invitation(FirebaseApp.shared.testTeam.id, person.id);
        const invitationId = await FirebaseApp.shared.functions.invitation.invite.execute(invitation);
        const result = await FirebaseApp.shared.functions.invitation.getInvitation.execute(invitationId);
        expect(result).toBeEqual(InvitationGetInvitationFunction.ReturnType.from(FirebaseApp.shared.testTeam.id, FirebaseApp.shared.testTeam.name, person.id));
    });

    it('should get invitation for team', async () => {
        const person = FirebaseApp.shared.testTeam.persons[1];
        person.signInProperties = null;
        await FirebaseApp.shared.firestore.person(FirebaseApp.shared.testTeam.id, person.id).set(person);
        const invitation = new Invitation(FirebaseApp.shared.testTeam.id, null);
        const invitationId = await FirebaseApp.shared.functions.invitation.invite.execute(invitation);
        const result = await FirebaseApp.shared.functions.invitation.getInvitation.execute(invitationId);
        expect(result.teamId).toBeEqual(FirebaseApp.shared.testTeam.id);
        expect(result.persons).not.toBeNull();
        expect(result.persons!.length).toBeEqual(1);
        expect(result.persons![0]).toBeEqual({
            id: person.id,
            properties: person.properties
        });
    });
});
