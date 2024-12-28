import * as functions from 'firebase-functions';
import { AuthUser, FirebaseFunction, Flatten, ILogger, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';
import { PersonId, PersonPrivateProperties, PersonSignInProperties, User, UserId, UserRole } from '../types';
import { Firestore } from '../Firestore';
import { TeamId } from '../types/Team';

export type Parameters = {
    id: TeamId
    name: string
    paypalMeLink: string | null
    personId: PersonId
    personProperties: PersonPrivateProperties
}

export class TeamNewFunction implements FirebaseFunction<Parameters, User> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        id: TeamId.builder,
        name: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder(),
        personId: PersonId.builder,
        personProperties: PersonPrivateProperties.builder
    });

    public constructor(
        private readonly authUser: AuthUser | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('TeamNewFunction.constructor', null, 'notice');
    }

    public async execute(parameters: Parameters): Promise<User> {
        this.logger.log('TeamNewFunction.execute');

        if (this.authUser === null)
            throw new functions.https.HttpsError('permission-denied', 'User is not authenticated');
        const userId = UserId.builder.build(this.authUser.id, this.logger.nextIndent);

        const teamSnapshot = await Firestore.shared.team(parameters.id).snapshot();
        if (teamSnapshot.exists)
            throw new functions.https.HttpsError('already-exists', 'Team already exists');

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        let user = User.empty(userId);
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data, this.logger.nextIndent);

        user.teams.set(parameters.id, {
            name: parameters.name,
            personId: parameters.personId
        });
        await Firestore.shared.user(userId).set(user);

        await Firestore.shared.team(parameters.id).set({
            name: parameters.name,
            paypalMeLink: parameters.paypalMeLink
        });

        const signInProperties = PersonSignInProperties.empty(userId);
        signInProperties.roles = UserRole.all;
        await Firestore.shared.person(parameters.id, parameters.personId).set({
            id: parameters.personId,
            properties: parameters.personProperties,
            fineIds: [],
            signInProperties: signInProperties
        });

        if (!userSnapshot.exists)
            await Firestore.shared.auth(this.authUser.rawUid).set({ userId: userId.value });

        return user;
    }
}
