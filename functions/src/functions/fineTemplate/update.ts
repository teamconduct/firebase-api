import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { FineTemplateUpdateFunction } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class FineTemplateUpdateExecutableFunction extends FineTemplateUpdateFunction implements ExecutableFirebaseFunction<FineTemplateUpdateFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineTemplateUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, { anyOf: ['team-manager', 'fineTemplate-manager'] });

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
