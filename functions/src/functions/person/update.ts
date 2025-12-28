import { FunctionsError } from '@stevenkellner/firebase-function';
import { PersonUpdateFunctionBase, PersonUpdateFunctionParameters, checkAuthentication, Person, Firestore } from '@stevenkellner/team-conduct-api';
export class PersonUpdateFunction extends PersonUpdateFunctionBase {

    public async execute(parameters: PersonUpdateFunctionParameters): Promise<void> {

        await checkAuthentication(this.userId, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.id).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data);

        await Firestore.shared.person(parameters.teamId, parameters.id).set(new Person(parameters.id, parameters.properties, person.fineIds, person.signInProperties));
    }
}
