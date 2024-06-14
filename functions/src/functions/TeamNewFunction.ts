import * as functions from 'firebase-functions';
import { FirebaseFunction, Flattable, Flatten, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, UtcDate, ValueTypeBuilder } from 'firebase-function';
import { PersonPrivateProperties, User, UserRole } from '../types';
import { firestoreBase } from '../firestoreBase';

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

    private async existsTeam(id: Guid): Promise<boolean> {
        const teamDocument = firestoreBase.getSubCollection('teams').getDocument(id.guidString);
        const teamSnapshot = await teamDocument.snapshot();
        return teamSnapshot.exists;
    }

    private async updateUserDocument(userId: string, parameters: Parameters) {
        const userDocument = firestoreBase.getSubCollection('users').getDocument(userId);
        const userSnapshot = await userDocument.snapshot();
        let user: User = {
            teams: []
        };
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data, this.logger.nextIndent);
        user.teams.push({
            id: parameters.id,
            personId: parameters.personId,
            roles: UserRole.all
        });
        await userDocument.setValues(user);
    }

    private async addPersonToTeam(parameters: Parameters, userId: string) {
        await firestoreBase.getSubCollection('teams').getDocument(parameters.id.guidString).getSubCollection('persons').addDocument(parameters.personId.guidString, {
            id: parameters.personId,
            properties: Flattable.flatten(parameters.personProperties),
            fineIds: [],
            signInProperties: {
                userId: userId,
                signInDate: UtcDate.now,
                notificationTokens: {}
            }
        });
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('TeamNewFunction.execute');

        if (this.userId === null)
            throw new functions.https.HttpsError('permission-denied', 'User is not authenticated');

        if (await this.existsTeam(parameters.id))
            throw new functions.https.HttpsError('already-exists', 'Team already exists');

        await this.updateUserDocument(this.userId, parameters);

        await firestoreBase.getSubCollection('teams').addDocument(parameters.id.guidString, {
            name: parameters.name,
            paypalMeLink: parameters.paypalMeLink
        });

        await this.addPersonToTeam(parameters, this.userId);
    }
}
