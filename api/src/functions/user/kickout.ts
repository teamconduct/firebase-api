import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Team, User } from '../../types';
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

        if (userId.guidString === parameters.userId.guidString)
            throw new FunctionsError('invalid-argument', 'You cannot kick yourself out of a team.');

        const userSnapshot = await Firestore.shared.user(parameters.userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User not found.');
        const user = User.builder.build(userSnapshot.data);

        const userTeamProperties = user.teams.getOptional(parameters.teamId);
        if (userTeamProperties === null)
            throw new FunctionsError('not-found', 'User is not a member of the team.');

        await Firestore.shared.person(parameters.teamId, userTeamProperties.personId).remove();
    }
}
