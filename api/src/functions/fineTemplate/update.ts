import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { FineTemplate, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type FineTemplateUpdateFunctionParameters = {
    teamId: Team.Id,
    fineTemplate: FineTemplate
};
export abstract class FineTemplateUpdateFunctionBase extends FirebaseFunction<FineTemplateUpdateFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateUpdateFunctionParameters>, FineTemplateUpdateFunctionParameters>({
        teamId: Team.Id.builder,
        fineTemplate: FineTemplate.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
