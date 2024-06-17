import * as functions from 'firebase-functions';
import * as i18n from 'i18n';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder } from 'firebase-function';
import { Fine, Person } from '../types';
import { checkAuthentication } from '../checkAuthentication';
import { pushNotification } from '../pushNotification';
import { Firestore } from '../Firestore';

export type Parameters = {
    teamId: Guid,
    personId: Guid,
    fine: Fine
};

export class FineAddFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        personId: new TypeBuilder(Guid.from),
        fine: Fine.builder
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('FineAddFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('FineAddFunction.execute');

        await checkAuthentication(this.userId, this.logger.nextIndent, parameters.teamId, 'fine-add');

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
            body: i18n.__('notification.new-fine.body', parameters.fine.amount.completeValue as unknown as string)
        }, this.logger.nextIndent);
    }
}
