import { ExecutableFirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { UserKickoutFunction, checkAuthentication, User, Person, Firestore } from '@stevenkellner/team-conduct-api';

export class UserKickoutExecutableFunction extends UserKickoutFunction implements ExecutableFirebaseFunction<UserKickoutFunction.Parameters, void> {

    public async execute(userAuthId: string | null, parameters: UserKickoutFunction.Parameters): Promise<void> {

        const userId = await checkAuthentication(rawUserId, parameters.teamId, 'team-manager');

        if (userId.value === parameters.userId.value)
            throw new FunctionsError('invalid-argument', 'You cannot kick yourself out of a team.');

        const userSnapshot = await Firestore.shared.user(parameters.userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');
        const user = User.builder.build(userSnapshot.data);

        const userTeamProperties = user.teams.getOptional(parameters.teamId);
        if (userTeamProperties === null)
            throw new FunctionsError('not-found', 'User is not a member of the team.');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, userTeamProperties.personId).snapshot();
        if (!personSnapshot.exists)
            throw new FunctionsError('not-found', 'Person not found.');
        const person = Person.builder.build(personSnapshot.data);

        person.signInProperties = null;
        await Firestore.shared.person(parameters.teamId, userTeamProperties.personId).set(person);

        user.teams.delete(parameters.teamId);
        await Firestore.shared.user(parameters.userId).set(user);
    }
}
