import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { PersonUpdateFunction, checkAuthentication, Person, Firestore } from '@stevenkellner/team-conduct-api';
export class PersonUpdateExecutableFunction extends PersonUpdateFunction implements ExecutableFirebaseFunction<PersonUpdateFunction.Parameters, void> {

    public async execute(userId: string | null, parameters: PersonUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties, person.fineIds, person.signInProperties));
    }
}
