import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Configuration, Fine, FineAmount, Localization, Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';
import { pushNotification } from '../../pushNotification';

export namespace FineDeleteFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        id: Fine.Id,
        configuration: Configuration
    }
}

export class FineDeleteFunction extends FirebaseFunction<FineDeleteFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineDeleteFunction.Parameters>, FineDeleteFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        id: Fine.Id.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: FineDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fine-manager');

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.id).snapshot();
        if (!fineSnapshot.exists)
            throw new FunctionsError('not-found', 'Fine not found');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        await Firestore.shared.fine(parameters.teamId, parameters.id).remove();

        person.fineIds = person.fineIds.filter(id => id.guidString !== parameters.id.guidString);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);

        Localization.locale = parameters.configuration.locale;
        await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
            title: Localization.shared.notification.fine.stateChange.title.value(),
            body: Localization.shared.notification.fine.stateChange.bodyDeleted.value({
                amount: FineAmount.builder.build(fineSnapshot.data.amount).formatted(parameters.configuration),
                reason: fineSnapshot.data.reason
            })
        });
    }
}
