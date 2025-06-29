import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Invitation } from '../../types';
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';

export class InvitationInviteFunction extends FirebaseFunction<Invitation, Invitation.Id> {

    public parametersBuilder = Invitation.builder;

    public returnTypeBuilder = Invitation.Id.builder;

    public async execute(invitation: Invitation): Promise<Invitation.Id> {

        await checkAuthentication(this.userId, invitation.teamId, 'team-manager');

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
