import * as functions from 'firebase-functions';
import { FirebaseFunction, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { PersonPrivateProperties, PersonSignInProperties, User, UserRole } from '../types';
import { Firestore } from '../Firestore';

export type Parameters = {
    id: Guid
    name: string
    paypalMeLink: string | null
    personId: Guid
    personProperties: PersonPrivateProperties
}

export class TeamNewFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        id: new TypeBuilder(Guid.from),
        name: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder(),
        personId: new TypeBuilder(Guid.from),
        personProperties: PersonPrivateProperties.builder
    });

    public constructor(
        private readonly userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('TeamNewFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('TeamNewFunction.execute');

        if (this.userId === null)
            throw new functions.https.HttpsError('permission-denied', 'User is not authenticated');

        const teamSnapshot = await Firestore.shared.team(parameters.id).snapshot();
        if (teamSnapshot.exists)
            throw new functions.https.HttpsError('already-exists', 'Team already exists');

        const userSnapshot = await Firestore.shared.user(this.userId).snapshot();
        let user = User.empty();
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data, this.logger.nextIndent);

        user.teams[parameters.id.guidString] = {
            personId: parameters.personId,
            roles: UserRole.all
        };
        await Firestore.shared.user(this.userId).set(user);

        await Firestore.shared.team(parameters.id).set({
            name: parameters.name,
            paypalMeLink: parameters.paypalMeLink
        });

        await Firestore.shared.person(parameters.id, parameters.personId).set({
            id: parameters.personId,
            properties: parameters.personProperties,
            fineIds: [],
            signInProperties: PersonSignInProperties.empty(this.userId)
        });
    }
}
