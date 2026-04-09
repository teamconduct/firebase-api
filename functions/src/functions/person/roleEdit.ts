import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { PersonRoleEditFunction, Person } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore, NotificationSender } from '../../firebase';

export class PersonRoleEditExecutableFunction extends PersonRoleEditFunction implements ExecutableFirebaseFunction<PersonRoleEditFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: PersonRoleEditFunction.Parameters): Promise<void> {

        const userId = await checkAuthentication(userAuthId, parameters.teamId, 'team-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'User does not exist');
        const person = Person.builder.build(personSnapshot.data);

        if (person.signInProperties === null)
            throw new FunctionsError('permission-denied', 'User is not signed in');

        if (person.signInProperties.userId.value === userId.value && !parameters.roles.includes('team-manager'))
            throw new FunctionsError('unavailable', 'User cannot remove their own team-manager role');

        person.signInProperties.roles = parameters.roles;
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);

        await NotificationSender.for(parameters.teamId, parameters.personId)
            .personRoleChanged();
    }
}
