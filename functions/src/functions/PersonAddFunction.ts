import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { Person, PersonPrivateProperties } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { Firestore } from '../Firestore';

export type Parameters = {
    teamId: Guid
    person: Omit<Person, 'fineIds' | 'signInProperties'>
};

export class PersonAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        person: new ObjectTypeBuilder({
            id: new TypeBuilder(Guid.from),
            properties: PersonPrivateProperties.builder
        })
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('PersonAddFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('PersonAddFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'person-add');

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
