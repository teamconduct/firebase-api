import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { FineTemplate, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace FineTemplateUpdateFunction {

    export type Parameters = {
        teamId: Team.Id,
        fineTemplate: FineTemplate
};
}

export class FineTemplateUpdateFunction implements FirebaseFunction<FineTemplateUpdateFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateUpdateFunction.Parameters>, FineTemplateUpdateFunction.Parameters>({
        teamId: Team.Id.builder,
        fineTemplate: FineTemplate.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
