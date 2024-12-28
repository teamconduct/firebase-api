import * as functions from 'firebase-functions';
import * as i18n from 'i18n';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder } from 'firebase-function';
import { Fine, Person, PersonId } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';
import { FineValue } from '../types/FineValue';

export type Parameters = {
    teamId: TeamId,
    personId: PersonId,
    fine: Fine
};

export class FineAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: TeamId.builder,
        personId: PersonId.builder,
        fine: Fine.builder
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineAddFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineAddFunction.execute');

        await checkAuthentication(this.authUser, this.logger.nextIndent, parameters.teamId, 'fine-manager');

        const fineSnapshot = await Firestore.shared.fine(parameters.teamId, parameters.fine.id).snapshot();
        if (fineSnapshot.exists)
            throw new functions.https.HttpsError('already-exists', 'Fine already exists');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        await Firestore.shared.fine(parameters.teamId, parameters.fine.id).set(parameters.fine);

        person.fineIds.push(parameters.fine.id);
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);

        await pushNotification(parameters.teamId, parameters.personId, 'new-fine', {
            title: i18n.__('notification.new-fine.title', parameters.fine.reason),
            body: i18n.__('notification.new-fine.body', FineValue.format(parameters.fine.value))
        }, this.logger.nextIndent);
    }
}
