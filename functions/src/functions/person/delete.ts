import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Person, PersonDeleteFunction } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class PersonDeleteExecutableFunction extends PersonDeleteFunction implements ExecutableFirebaseFunction<PersonDeleteFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: PersonDeleteFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, { anyOf: ['team-manager', 'person-manager'] });

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties !== null)
            throw new FunctionsError('failed-precondition', 'Person is signed in');

        const batch = Firestore.shared.batch();

        batch.remove(Firestore.shared.person(parameters.teamId, parameters.id));

        for (const fineId of person.fineIds)
            batch.remove(Firestore.shared.fine(parameters.teamId, fineId));

        await batch.commit();

    }
}
