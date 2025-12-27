import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { FineTemplate, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type FineTemplateDeleteFunctionParameters = {
    teamId: Team.Id,
    id: FineTemplate.Id
};

export abstract class FineTemplateDeleteFunctionBase extends FirebaseFunction<FineTemplateDeleteFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateDeleteFunctionParameters>, FineTemplateDeleteFunctionParameters>({
        teamId: Team.Id.builder,
        id: FineTemplate.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
