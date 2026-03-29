import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Person, Localization, FineAddFunction, Team } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore, pushNotification } from '../../firebase';

export class FineAddExecutableFunction extends FineAddFunction implements ExecutableFirebaseFunction<FineAddFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineAddFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, {
            anyOf: ['team-manager', 'fine-manager', 'fine-can-add']
        });

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const teamSettings = Team.builder.build(teamSnapshot.data).settings;

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.fine.id).snapshot();
        if (fineSnapshot.exists)
            throw new FunctionsError('already-exists', 'Fine already exists');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        const batch = Firestore.shared.batch();

        batch.set(Firestore.shared.fine(parameters.teamId, parameters.fine.id), parameters.fine);

        person.fineIds.push(parameters.fine.id);
        batch.set(Firestore.shared.person(parameters.teamId, parameters.personId), person);

        await batch.commit();

        const localization = Localization.shared(teamSettings.locale);
        await pushNotification(parameters.teamId, parameters.personId, 'new-fine', {
            title: localization.notification.fine.new.title.value({
                reason: parameters.fine.reason
            }),
            body: localization.notification.fine.new.body.value({
                amount: parameters.fine.amount.formatted(teamSettings.currency, teamSettings.locale)
            })
        });
    }
}
