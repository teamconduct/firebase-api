import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';

export type Parameters = {
    teamId: Guid,
    id: Guid
}

export class PersonDeleteFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        id: new TypeBuilder(Guid.from)
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('PersonDeleteFunction.constructor', null, 'notice');
    }

    private async existsTeam(id: Guid): Promise<boolean> {
        const teamDocument = firestoreBase.getSubCollection('teams').getDocument(id.guidString);
        const teamSnapshot = await teamDocument.snapshot();
        return teamSnapshot.exists;
    }

    private async existsPerson(teamId: Guid, id: Guid): Promise<boolean> {
        const personDocument = firestoreBase.getSubCollection('teams').getDocument(teamId.guidString).getSubCollection('persons').getDocument(id.guidString);
        const personSnapshot = await personDocument.snapshot();
        return personSnapshot.exists;
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('PersonDeleteFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'person-delete');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');


        const personSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.id.guidString).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');

        if (personSnapshot.data.signInProperties !== null)
            throw new functions.https.HttpsError('failed-precondition', 'Person is signed in');

        if (!await this.existsPerson(parameters.teamId, parameters.id))
            throw new functions.https.HttpsError('not-found', 'Person not found');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').removeDocument(parameters.id.guidString);
    }
}
