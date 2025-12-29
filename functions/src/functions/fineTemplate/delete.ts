import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { checkAuthentication, FineTemplateDeleteFunction, Firestore } from '@stevenkellner/team-conduct-api';

export class FineTemplateDeleteExecutableFunction extends FineTemplateDeleteFunction implements ExecutableFirebaseFunction<FineTemplateDeleteFunction.Parameters, void> {

    public async execute(userAuthId: string | null, parameters: FineTemplateDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).remove();
    }
}
