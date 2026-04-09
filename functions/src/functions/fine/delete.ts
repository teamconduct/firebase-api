import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Fine, FineDeleteFunction, Person, Team } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore, NotificationSender } from '../../firebase';

export class FineDeleteExecutableFunction extends FineDeleteFunction implements ExecutableFirebaseFunction<FineDeleteFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: FineDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, { anyOf: ['team-manager', 'fine-manager'] });

        const teamSnapshot = await Firestore.shared.team(parameters.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const teamSettings = Team.builder.build(teamSnapshot.data).settings;

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.id).snapshot();
        if (!fineSnapshot.exists)
            throw new FunctionsError('not-found', 'Fine not found');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        const batch = Firestore.shared.batch();

        batch.remove(Firestore.shared.fine(parameters.teamId, parameters.id));

        person.fineIds = person.fineIds.filter(id => id.guidString !== parameters.id.guidString);
        batch.set(Firestore.shared.person(parameters.teamId, parameters.personId), person);

        await batch.commit();

        await NotificationSender.for(parameters.teamId, parameters.personId)
            .fineDeleted(fineSnapshot.data.reason, Fine.Amount.builder.build(fineSnapshot.data.amount), teamSettings);
    }
}
