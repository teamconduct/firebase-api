import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { FineTemplate, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace FineTemplateAddFunction {

    export type Parameters = {
        teamId: Team.Id,
        fineTemplate: FineTemplate
    };
}

export class FineTemplateAddFunction implements FirebaseFunction<FineTemplateAddFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateAddFunction.Parameters>, FineTemplateAddFunction.Parameters>({
        teamId: Team.Id.builder,
        fineTemplate: FineTemplate.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
