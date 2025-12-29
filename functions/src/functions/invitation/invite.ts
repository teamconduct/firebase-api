import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { InvitationInviteFunction, Invitation, checkAuthentication, Firestore } from '@stevenkellner/team-conduct-api';

export class InvitationInviteExecutableFunction extends InvitationInviteFunction implements ExecutableFirebaseFunction<Invitation, Invitation.Id> {

    public parametersBuilder = Invitation.builder;

    public returnTypeBuilder = Invitation.Id.builder;

    public async execute(userAuthId: UserAuthId | null, invitation: Invitation): Promise<Invitation.Id> {

        await checkAuthentication(userAuthId, invitation.teamId, 'team-manager');

        if (invitation.personId !== null) {

            const personSnapshot = await Firestore.shared.person(invitation.teamId, invitation.personId).snapshot();
            if (!personSnapshot.exists)
                throw new FunctionsError('not-found', 'Person not found');

            if (personSnapshot.data.signInProperties !== null)
                throw new FunctionsError('already-exists', 'Person already has an account');

        }

        const invitationId = invitation.createId();
        await Firestore.shared.invitation(invitationId).set(invitation);

        return invitationId;
    }
}
