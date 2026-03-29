import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { Person, PersonProperties, PersonSignInProperties, Team, TeamNewFunction, TeamRole, User } from '@stevenkellner/team-conduct-api';
import { Firestore } from '../../firebase';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

export class TeamNewExecutableFunction extends TeamNewFunction implements ExecutableFirebaseFunction<TeamNewFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: TeamNewFunction.Parameters): Promise<void> {

        if (userAuthId === null)
            throw new FunctionsError('unauthenticated', 'User is not authenticated');

        const userAuthSnapshot = await Firestore.shared.userAuth(userAuthId).snapshot();
        if (!userAuthSnapshot.exists)
            throw new FunctionsError('permission-denied', 'User authentication does not exist');
        const userId = User.Id.builder.build(userAuthSnapshot.data.userId);

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User does not exist');
        const user = User.builder.build(userSnapshot.data);

        const batch = Firestore.shared.batch();

        const teamProperties = new User.TeamProperties(parameters.id, parameters.name, parameters.teamPersonId);
        user.teams.set(parameters.id, teamProperties);
        batch.set(Firestore.shared.user(userId), user);

        const teamSettings = new Team.TeamSettings(parameters.paypalMeLink, true, 'all-fines', 'public-link-with-approval', parameters.currency, parameters.locale)
        const team = new Team(parameters.id, parameters.name, parameters.teamLogoUrl, parameters.teamSportCategory, parameters.teamDescription, teamSettings);
        batch.set(Firestore.shared.team(parameters.id), team);


        const signInProperties = new PersonSignInProperties(userId, UtcDate.now, [...TeamRole.all]);
        const personProperties = new PersonProperties(user.properties.firstName, user.properties.lastName);
        const person = new Person(parameters.teamPersonId, personProperties, [], signInProperties);
        batch.set(Firestore.shared.person(parameters.id, parameters.teamPersonId), person);

        await batch.commit();
    }
}
