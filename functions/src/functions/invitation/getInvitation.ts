import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { InvitationGetInvitationFunction, Invitation, Team, Person, Firestore } from '@stevenkellner/team-conduct-api';
import { compactMap } from '@stevenkellner/typescript-common-functionality';

export class InvitationGetInvitationExecutableFunction extends InvitationGetInvitationFunction implements ExecutableFirebaseFunction<Invitation.Id, InvitationGetInvitationFunction.ReturnType> {

    public async execute(userAuthId: UserAuthId | null, invitationId: Invitation.Id): Promise<InvitationGetInvitationFunction.ReturnType> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User not authenticated');

        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');
        const invitation = Invitation.builder.build(invitationSnapshot.data);

        const teamSnapshot = await Firestore.shared.team(invitation.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        if (invitation.personId !== null)
            return InvitationGetInvitationFunction.ReturnType.from(invitation.teamId, team.name, invitation.personId);

        const personSnapshots = await Firestore.shared.persons(invitation.teamId).documentSnapshots();
        const persons = compactMap(personSnapshots, personSnapshot => {
            if (!personSnapshot.exists)
                return null;
            const person = Person.builder.build(personSnapshot.data);
            if (person.signInProperties !== null)
                return null;
            return {
                id: person.id,
                properties: person.properties
            };
        });
        return InvitationGetInvitationFunction.ReturnType.from(invitation.teamId, team.name, persons);
    }
}
