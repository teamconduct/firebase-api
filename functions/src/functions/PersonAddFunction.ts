import * as functions from 'firebase-functions';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { Person, PersonId, PersonPrivateProperties } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type Parameters = {
    teamId: TeamId
    person: Omit<Person, 'fineIds' | 'signInProperties'>
};

export class PersonAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        person: new ObjectTypeBuilder({
            id: PersonId.builder,
            properties: PersonPrivateProperties.builder
        })
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('PersonAddFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('PersonAddFunction.execute');

        await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'person-manager');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.person.id).snapshot();
        if (personSnapshot.exists)
            throw new functions.https.HttpsError('already-exists', 'Person already exists');

        await Firestore.shared.person(parameters.teamId, parameters.person.id).set({
            ...parameters.person,
            fineIds: [],
            signInProperties: null
        });
    }
}
