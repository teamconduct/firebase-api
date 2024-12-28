import * as functions from 'firebase-functions';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';
import { PersonId } from '../types';

export type Parameters = {
    teamId: TeamId,
    id: PersonId
}

export class PersonDeleteFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        id: PersonId.builder
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('PersonDeleteFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('PersonDeleteFunction.execute');

        await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Team not found');

        if (personSnapshot.data.signInProperties !== null)
            throw new functions.https.HttpsError('failed-precondition', 'Person is signed in');

        await Firestore.shared.person(parameters.teamId, parameters.id).remove();
    }
}
