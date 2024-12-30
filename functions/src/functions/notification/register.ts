import { NotificationProperties } from './../../types/NotificationProperties';
import { FirebaseFunction, FunctionsError } from "@stevenkellner/firebase-function/admin";
import { Person, Team } from "../../types";
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from "@stevenkellner/typescript-common-functionality";
import { Firestore } from "../../Firestore";

export namespace NotificationRegisterFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        token: string
    }
}

export class NotificationRegisterFunction extends FirebaseFunction<NotificationRegisterFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<NotificationRegisterFunction.Parameters>, NotificationRegisterFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        token: new ValueTypeBuilder()
    });

    public constructor() {
        super('NotificationRegisterFunction');
    }

    public async execute(parameters: NotificationRegisterFunction.Parameters): Promise<void> {
        this.logger.log('NotificationRegisterFunction.execute');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties === null)
            throw new FunctionsError('unauthenticated', 'Person not signed in');

        person.signInProperties.notificationProperties.tokens.set(NotificationProperties.TokenId.create(parameters.token), parameters.token);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
