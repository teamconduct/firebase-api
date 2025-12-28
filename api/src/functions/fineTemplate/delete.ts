import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { FineTemplate, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace FineTemplateDeleteFunction {

    export type Parameters = {
        teamId: Team.Id,
        id: FineTemplate.Id
    };
}

export class FineTemplateDeleteFunction implements FirebaseFunction<FineTemplateDeleteFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateDeleteFunction.Parameters>, FineTemplateDeleteFunction.Parameters>({
        teamId: Team.Id.builder,
        id: FineTemplate.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
