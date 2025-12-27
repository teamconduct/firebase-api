import { FunctionsError } from '@stevenkellner/firebase-function';
import { Person, checkAuthentication, Firestore, pushNotification, Localization, FineAddFunctionBase, FineAddFunctionParameters } from '@stevenkellner/team-conduct-api';

export class FineAddFunction extends FineAddFunctionBase {

    public async execute(parameters: FineAddFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, {
            anyOf: ['fine-manager', 'fine-can-add']
        });

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

        const localization = Localization.shared(parameters.configuration.locale);
        await pushNotification(parameters.teamId, parameters.personId, 'new-fine', {
            title: localization.notification.fine.new.title.value({
                reason: parameters.fine.reason
            }),
            body: localization.notification.fine.new.body.value({
                amount: parameters.fine.amount.formatted(parameters.configuration)
            })
        });
    }
}
