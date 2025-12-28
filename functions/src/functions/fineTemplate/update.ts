import { FunctionsError } from '@stevenkellner/firebase-function';
import { checkAuthentication, FineTemplateUpdateFunctionBase, FineTemplateUpdateFunctionParameters, Firestore } from '@stevenkellner/team-conduct-api';

export class FineTemplateUpdateFunction extends FineTemplateUpdateFunctionBase {

    public async execute(parameters: FineTemplateUpdateFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
