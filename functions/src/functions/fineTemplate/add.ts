import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function";
import { FineTemplate, Team } from "../../types";
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { checkAuthentication } from "../../checkAuthentication";
import { Firestore } from "../../Firestore";

export namespace FineTemplateAddFunction {

    export type Parameters = {
        teamId: Team.Id,
        fineTemplate: FineTemplate
    }
}

export class FineTemplateAddFunction extends FirebaseFunction<FineTemplateAddFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateAddFunction.Parameters>, FineTemplateAddFunction.Parameters>({
        teamId: Team.Id.builder,
        fineTemplate: FineTemplate.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: FineTemplateAddFunction.Parameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (fineTemplateSnapshot.exists)
            throw new FunctionsError('already-exists', 'FineTemplate already exists');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}
