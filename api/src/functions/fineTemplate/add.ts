import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { FineTemplate, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type FineTemplateAddFunctionParameters = {
    teamId: Team.Id,
    fineTemplate: FineTemplate
};

export abstract class FineTemplateAddFunctionBase extends FirebaseFunction<FineTemplateAddFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateAddFunctionParameters>, FineTemplateAddFunctionParameters>({
        teamId: Team.Id.builder,
        fineTemplate: FineTemplate.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
