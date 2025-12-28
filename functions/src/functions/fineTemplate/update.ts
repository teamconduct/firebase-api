import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { checkAuthentication, FineTemplateUpdateFunction, Firestore } from '@stevenkellner/team-conduct-api';

export class FineTemplateUpdateExecutableFunction extends FineTemplateUpdateFunction implements ExecutableFirebaseFunction<FineTemplateUpdateFunction.Parameters, void> {

    public async execute(userId: string | null, parameters: FineTemplateUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(userId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
