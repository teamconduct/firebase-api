import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { PersonUpdateFunction, Person } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';
export class PersonUpdateExecutableFunction extends PersonUpdateFunction implements ExecutableFirebaseFunction<PersonUpdateFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: PersonUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.teamId, { anyOf: ['team-manager', 'person-manager'] });

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties, person.fineIds, person.signInProperties));
    }
}
