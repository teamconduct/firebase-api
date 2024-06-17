import * as functions from 'firebase-functions';
import { FirebaseFunction, Guid, ILogger, ValueTypeBuilder } from 'firebase-function';
import { Person, PersonSignInProperties, User } from '../types';
import { Invitation } from '../types/Invitation';
import { Firestore } from '../Firestore';

export type ReturnType = {
    teamId: Guid,
    personId: Guid
};

export class InvitationRegisterFunction implements FirebaseFunction<string, ReturnType> {

    public parametersBuilder = new ValueTypeBuilder<string>();

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('InvitationRegisterFunction.constructor', null, 'notice');
    }

    public async execute(invitationId: string): Promise<ReturnType> {
        this.logger.log('InvitationRegisterFunction.execute');

        if (this.userId === null)
            throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');

        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Invitation not found');
        const invitation = Invitation.builder.build(invitationSnapshot.data, this.logger.nextIndent);

        const userSnapshot = await Firestore.shared.user(this.userId).snapshot();
        let user = User.empty();
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data, this.logger.nextIndent);

        if (invitation.teamId.guidString in user.teams)
            throw new functions.https.HttpsError('already-exists', 'User already in team');

        const personSnapshot = await Firestore.shared.person(invitation.teamId, invitation.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        if (person.signInProperties !== null)
            throw new functions.https.HttpsError('already-exists', 'Person already registered');

        await Firestore.shared.invitation(invitationId).remove();

        user.teams[invitation.teamId.guidString] = {
            personId: invitation.personId,
            roles: []
        };
        await Firestore.shared.user(this.userId).set(user);

        person.signInProperties = PersonSignInProperties.empty(this.userId);
        await Firestore.shared.person(invitation.teamId, invitation.personId).set(person);

        return invitation;
    }
}
