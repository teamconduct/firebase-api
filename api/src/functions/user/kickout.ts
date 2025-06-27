import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Person, Team, User } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Firestore } from '../../Firestore';
import { checkAuthentication } from '../../checkAuthentication';

export namespace UserKickoutFunction {

    export type Parameters = {
        teamId: Team.Id
        userId: User.Id
    };
}

export class UserKickoutFunction extends FirebaseFunction<UserKickoutFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserKickoutFunction.Parameters>, UserKickoutFunction.Parameters>({
        teamId: Team.Id.builder,
        userId: User.Id.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();

    public async execute(parameters: UserKickoutFunction.Parameters): Promise<void> {

        const userId = await checkAuthentication(this.userId, parameters.teamId, 'team-manager');

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
