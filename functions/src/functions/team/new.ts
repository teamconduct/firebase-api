import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { TeamNewFunction, User, Team, PersonSignInProperties, NotificationProperties, UserRole, Person, Firestore } from '@stevenkellner/team-conduct-api';
import { UtcDate } from '@stevenkellner/typescript-common-functionality';

export class TeamNewExecutableFunction extends TeamNewFunction implements ExecutableFirebaseFunction<TeamNewFunction.Parameters, User> {

    public async execute(userAuthId: UserAuthId | null, parameters: TeamNewFunction.Parameters): Promise<User> {

        if (rawUserId === null)
            throw new FunctionsError('permission-denied', 'User is not authenticated');
        const userId = User.Id.builder.build(rawUserId);

        const teamSnapshot = await Firestore.shared.team(parameters.id).snapshot();
        if (teamSnapshot.exists)
            throw new FunctionsError('already-exists', 'Team already exists');

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        let user = new User(userId);
        if (userSnapshot.exists)
            user = User.builder.build(userSnapshot.data);

        user.teams.set(parameters.id, new User.TeamProperties(parameters.id, parameters.name, parameters.personId));
        await Firestore.shared.user(userId).set(user);

        await Firestore.shared.team(parameters.id).set(new Team(parameters.id, parameters.name, parameters.paypalMeLink));

        const signInProperties = new PersonSignInProperties(userId, UtcDate.now, new NotificationProperties(), [...UserRole.all]);
        await Firestore.shared.person(parameters.id, parameters.personId).set(new Person(parameters.personId, parameters.personProperties, [], signInProperties));

        return user;
    }
}
