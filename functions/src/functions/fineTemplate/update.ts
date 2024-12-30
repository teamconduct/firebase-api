import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function/admin";
import { FineTemplate, Team } from "../../types";
import { Flattable, ObjectTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { checkAuthentication } from "../../checkAuthentication";
import { Firestore } from "../../Firestore";

export namespace FineTemplateUpdateFunction {

    export type Parameters = {
        teamId: Team.Id,
        fineTemplate: FineTemplate
    };
}

export class FineTemplateUpdateFunction extends FirebaseFunction<FineTemplateUpdateFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineTemplateUpdateFunction.Parameters>, FineTemplateUpdateFunction.Parameters>({
        teamId: Team.Id.builder,
        fineTemplate: FineTemplate.builder
    });

    public constructor() {
        super('FineTemplateUpdateFunction');
    }

    public async execute(parameters: FineTemplateUpdateFunction.Parameters): Promise<void> {
        this.logger.log('FineTemplateUpdateFunction.execute');

        await checkAuthentication(this.userId, parameters.teamId, 'fineTemplate-manager');

        const fineTemplateSnapshot = await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).snapshot();
        if (!fineTemplateSnapshot.exists)
            throw new FunctionsError('not-found', 'FineTemplate not found');

        await Firestore.shared.fineTemplate(parameters.teamId, parameters.fineTemplate.id).set(parameters.fineTemplate);
    }
}