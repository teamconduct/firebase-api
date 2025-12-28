import { FunctionsError } from '@stevenkellner/firebase-function';
import { FineTemplateAddFunctionBase, FineTemplateAddFunctionParameters, Firestore, checkAuthentication } from '@stevenkellner/team-conduct-api';

export class FineTemplateAddFunction extends FineTemplateAddFunctionBase {

    public async execute(parameters: FineTemplateAddFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (fineTemplateSnapshot.exists)
            throw new FunctionsError('already-exists', 'FineTemplate already exists');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
