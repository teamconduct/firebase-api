import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Invitation, InvitationGetInvitationFunction, Person, Team } from '@stevenkellner/team-conduct-api';
import { Firestore } from '../../firebase';

export class InvitationGetInvitationExecutableFunction extends InvitationGetInvitationFunction implements ExecutableFirebaseFunction<Invitation.Id, InvitationGetInvitationFunction.ReturnType> {

    public async execute(_userAuthId: UserAuthId | null, invitationId: Invitation.Id): Promise<InvitationGetInvitationFunction.ReturnType> {

        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found.');
        const invitation = Invitation.builder.build(invitationSnapshot.data);

        const teamSnapshot = await Firestore.shared.team(invitation.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found.');
        const team = Team.builder.build(teamSnapshot.data);

        if (invitation.personId !== null)
            return InvitationGetInvitationFunction.ReturnType.from(invitation.teamId, team.name, invitation.personId);

        const personSnapshots = await Firestore.shared.persons(invitation.teamId).documentSnapshots();
        const unsignedPersons = personSnapshots
            .filter(snapshot => snapshot.exists)
            .map(snapshot => Person.builder.build(snapshot.data))
            .filter(person => person.signInProperties === null)
            .map(person => ({ id: person.id, properties: person.properties }));

        return InvitationGetInvitationFunction.ReturnType.from(invitation.teamId, team.name, unsignedPersons);
    }
}
