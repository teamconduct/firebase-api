import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function";
import { FineTemplate, Team } from "../../types";
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { checkAuthentication } from "../../checkAuthentication";
import { Firestore } from "../../Firestore";

export namespace FineTemplateDeleteFunction {

    export type Parameters = {
        teamId: Team.Id,
        id: FineTemplate.Id
    }
}

export class FineTemplateDeleteFunction extends FirebaseFunction<FineTemplateDeleteFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateDeleteFunction.Parameters>, FineTemplateDeleteFunction.Parameters>({
        teamId: Team.Id.builder,
        id: FineTemplate.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: FineTemplateDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.id).remove();
    }
}
