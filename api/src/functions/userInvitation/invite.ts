import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { UserInvitation } from '../../types';
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';

export class UserInvitationInviteFunction extends FirebaseFunction<UserInvitation, UserInvitation.Id> {

    public parametersBuilder = UserInvitation.builder;

    public returnTypeBuilder = UserInvitation.Id.builder;

    public async execute(invitation: UserInvitation): Promise<UserInvitation.Id> {

        await checkAuthentication(this.userId, invitation.teamId, 'team-manager');

        const personSnapshot = await Firestore.shared.person(invitation.teamId, invitation.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');

        if (personSnapshot.data.signInProperties !== null)
            throw new FunctionsError('already-exists', 'Person already has an account');

        const invitationId = invitation.createId();
        await Firestore.shared.userInvitation(invitationId).set(invitation);

        return invitationId;
    }
}
