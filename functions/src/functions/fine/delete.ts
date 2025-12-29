import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { checkAuthentication, FineAmount, FineDeleteFunction, Firestore, Localization, Person, pushNotification } from '@stevenkellner/team-conduct-api';

export class FineDeleteExecutableFunction extends FineDeleteFunction implements ExecutableFirebaseFunction<FineDeleteFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, 'fine-manager');

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

        const localization = Localization.shared(parameters.configuration.locale);
        await pushNotification(parameters.teamId, parameters.personId, 'fine-state-change', {
            title: localization.notification.fine.stateChange.title.value(),
            body: localization.notification.fine.stateChange.bodyDeleted.value({
                amount: FineAmount.builder.build(fineSnapshot.data.amount).formatted(parameters.configuration),
                reason: fineSnapshot.data.reason
            })
        });
    }
}
