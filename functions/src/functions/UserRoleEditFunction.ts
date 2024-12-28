import * as functions from 'firebase-functions';
import { ArrayTypeBuilder, AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { Person, PersonId, UserRole } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type Parameters = {
    teamId: TeamId
    personId: PersonId
    roles: UserRole[]
};

export class UserRoleEditFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        personId: PersonId.builder,
        roles: new ArrayTypeBuilder(new ValueTypeBuilder())
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('UserRoleEditFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('UserRoleEditFunction.execute');

        const userId = await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'team-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person does not exist');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        if (person.signInProperties === null)
            throw new functions.https.HttpsError('permission-denied', 'Person is not signed in');

        if (person.signInProperties.userId.value === userId.value && !parameters.roles.includes('team-manager'))
            throw new functions.https.HttpsError('invalid-argument', 'User cannot remove their own team-manager role');

        person.signInProperties.roles = parameters.roles;
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
