import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { FineTemplateDeleteFunction } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class FineTemplateDeleteExecutableFunction extends FineTemplateDeleteFunction implements ExecutableFirebaseFunction<FineTemplateDeleteFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineTemplateDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, { anyOf: ['team-manager', 'fineTemplate-manager'] });

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).remove();
    }
}
