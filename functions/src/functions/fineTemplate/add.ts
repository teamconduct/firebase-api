import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { FineTemplateAddFunction, Firestore, checkAuthentication } from '@stevenkellner/team-conduct-api';

export class FineTemplateAddExecutableFunction extends FineTemplateAddFunction implements ExecutableFirebaseFunction<FineTemplateAddFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineTemplateAddFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (fineTemplateSnapshot.exists)
            throw new FunctionsError('already-exists', 'FineTemplate already exists');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
