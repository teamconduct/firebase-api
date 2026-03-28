import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { TeamDeleteFunction, User } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class TeamDeleteExecutableFunction extends TeamDeleteFunction implements ExecutableFirebaseFunction<TeamDeleteFunction.Parameters, null> {

    public async execute(userAuthId: UserAuthId | null, parameters: TeamDeleteFunction.Parameters): Promise<null> {

        const userId = await checkAuthentication(userAuthId, parameters.id, 'team-manager');

        const userSnapshot = await Firestore.shared.user(userId).snapshot();
        if (!userSnapshot.exists)
            throw new FunctionsError('not-found', 'User does not exist');
        const user = User.builder.build(userSnapshot.data);

        const batch = Firestore.shared.batch();

        user.teams.delete(parameters.id);
        batch.set(Firestore.shared.user(userId), user);

        batch.remove(Firestore.shared.team(parameters.id));
        await batch.removeAllSubCollections(Firestore.shared.team(parameters.id));

        await batch.commit();

        return null;
    }
}
