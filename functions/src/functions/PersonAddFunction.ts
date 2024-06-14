import * as functions from 'firebase-functions';
import { FirebaseFunction, Flattable, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { PersonPrivateProperties } from '../types';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';

export type Parameters = {
    teamId: Guid
    id: Guid
    properties: PersonPrivateProperties
};

export class PersonAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        id: new TypeBuilder(Guid.from),
        properties: PersonPrivateProperties.builder
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('PersonAddFunction.constructor', null, 'notice');
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
        this.logger.log('PersonAddFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'person-add');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');

        if (await this.existsPerson(parameters.teamId, parameters.id))
            throw new functions.https.HttpsError('already-exists', 'Person already exists');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').addDocument(parameters.id.guidString, {
            id: parameters.id.guidString,
            properties: Flattable.flatten(parameters.properties),
            fineIds: [],
            signInProperties: null
        });
    }
}
