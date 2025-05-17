import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Configuration, Fine, Localization, Person, Team } from '../../types';
import { checkAuthentication } from '../../checkAuthentication';
import { Firestore } from '../../Firestore';
import { pushNotification } from '../../pushNotification';


export namespace FineAddFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        fine: Fine,
        configuration: Configuration
    };
}

export class FineAddFunction extends FirebaseFunction<FineAddFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<FineAddFunction.Parameters>, FineAddFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        fine: Fine.builder,
        configuration: Configuration.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: FineAddFunction.Parameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'fine-manager');

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.fine.id).snapshot();
        if (fineSnapshot.exists)
            throw new FunctionsError('already-exists', 'Fine already exists');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        await Firestore.shared.fine(parameters.teamId, parameters.fine.id).set(parameters.fine);

        person.fineIds.push(parameters.fine.id);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);

        Localization.shared.setLocale(parameters.configuration.locale);
        await pushNotification(parameters.teamId, parameters.personId, 'new-fine', {
            title: Localization.shared.get(key => key.notification.fine.new.title, parameters.fine.reason),
            body: Localization.shared.get(key => key.notification.fine.new.body, parameters.fine.amount.formatted(parameters.configuration))
        });
    }
}
