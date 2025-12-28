import { FunctionsError } from '@stevenkellner/firebase-function';
import { checkAuthentication, FineTemplateDeleteFunctionBase, FineTemplateDeleteFunctionParameters, Firestore } from '@stevenkellner/team-conduct-api';

export class FineTemplateDeleteFunction extends FineTemplateDeleteFunctionBase {

    public async execute(parameters: FineTemplateDeleteFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).remove();
    }
}
