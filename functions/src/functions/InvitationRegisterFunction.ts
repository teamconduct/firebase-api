import * as functions from 'firebase-functions';
import { FirebaseFunction, ILogger } from 'firebase-function';
import { Person, PersonId, PersonSignInProperties, User, UserId } from '../types';
import { Invitation, InvitationId } from '../types/Invitation';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type ReturnType = {
    teamId: TeamId,
    personId: PersonId
};

export class InvitationRegisterFunction implements FirebaseFunction<InvitationId, ReturnType> {

    public parametersBuilder = InvitationId.builder;

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('InvitationRegisterFunction.constructor', null, 'notice');
    }

    public async execute(invitationId: InvitationId): Promise<ReturnType> {
        this.logger.log('InvitationRegisterFunction.execute');


        if (this.userId === null)
            throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
        const userId = UserId.builder.build(this.userId, this.logger.nextIndent);

        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Invitation not found');
        const invitation = Invitation.builder.build(invitationSnapshot.data, this.logger.nextIndent);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        let user = User.empty();
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data, this.logger.nextIndent);

        if (user.teams.has(invitation.teamId))
            throw new functions.https.HttpsError('already-exists', 'User already in team');

        const personSnapshot = await Firestore.shared.person(invitation.teamId, invitation.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        if (person.signInProperties !== null)
            throw new functions.https.HttpsError('already-exists', 'Person already registered');

        await Firestore.shared.invitation(invitationId).remove();

        user.teams.set(invitation.teamId, {
            personId: invitation.personId,
            roles: []
        });
        await Firestore.shared.user(userId).set(user);

        person.signInProperties = PersonSignInProperties.empty(userId);
        await Firestore.shared.person(invitation.teamId, invitation.personId).set(person);

        return invitation;
    }
}
