import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, IntersectionTypeBuilder, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { Fine } from '../types';
import { firestoreBase } from '../firestoreBase';
import { checkAuthentication } from '../checkAuthentication';

type ParametersSubsection = {
    teamId: Guid
    personId: Guid
}

export type Parameters = ParametersSubsection & Fine;


export class FineUpdateFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new IntersectionTypeBuilder(
        new ObjectTypeBuilder<Flatten<ParametersSubsection>, ParametersSubsection>({
            teamId: new TypeBuilder(Guid.from),
            personId: new TypeBuilder(Guid.from)
        }),
        Fine.builder
    );

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineUpdateFunction.constructor', null, 'notice');
    }

    private async existsTeam(id: Guid): Promise<boolean> {
        const teamDocument = firestoreBase.getSubCollection('teams').getDocument(id.guidString);
        const teamSnapshot = await teamDocument.snapshot();
        return teamSnapshot.exists;
    }

    private async existsFine(teamId: Guid, id: Guid): Promise<boolean> {
        const fineDocument = firestoreBase.getSubCollection('teams').getDocument(teamId.guidString).getSubCollection('fines').getDocument(id.guidString);
        const fineSnapshot = await fineDocument.snapshot();
        return fineSnapshot.exists;
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineUpdateFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fine-update');

        if (!await this.existsTeam(parameters.teamId))
            throw new functions.https.HttpsError('not-found', 'Team not found');

        if (!await this.existsFine(parameters.teamId, parameters.id))
            throw new functions.https.HttpsError('not-found', 'Fine not found');

        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('fines').getDocument(parameters.id.guidString).setValues({
            id: parameters.id,
            reason: parameters.reason,
            amount: parameters.amount,
            date: parameters.date,
            payedState: parameters.payedState
        });
    }
}