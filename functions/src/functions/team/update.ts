import { ExecutableFirebaseFunction, FunctionsError, UserAuthId } from '@stevenkellner/firebase-function';
import { TeamUpdateFunction, Team } from '@stevenkellner/team-conduct-api';
import { checkAuthentication, Firestore } from '../../firebase';

export class TeamUpdateExecutableFunction extends TeamUpdateFunction implements ExecutableFirebaseFunction<TeamUpdateFunction.Parameters, void> {

    public async execute(userAuthId: UserAuthId | null, parameters: TeamUpdateFunction.Parameters): Promise<void> {

        await checkAuthentication(userAuthId, parameters.id, 'team-manager');

        const teamSnapshot = await Firestore.shared.team(parameters.id).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team does not exist');
        const team = Team.builder.build(teamSnapshot.data);

        if (parameters.name !== 'do-not-update')
            team.name = parameters.name;

        if (parameters.logoUrl !== 'do-not-update')
            team.logoUrl = parameters.logoUrl === 'remove' ? null : parameters.logoUrl;

        if (parameters.sportCategory !== 'do-not-update')
            team.sportCategory = parameters.sportCategory === 'remove' ? null : parameters.sportCategory;

        if (parameters.description !== 'do-not-update')
            team.description = parameters.description === 'remove' ? null : parameters.description;

        if (parameters.paypalMeLink !== 'do-not-update')
            team.settings.paypalMeLink = parameters.paypalMeLink === 'remove' ? null : parameters.paypalMeLink;

        if (parameters.allowMembersToAddFines !== 'do-not-update')
            team.settings.allowMembersToAddFines = parameters.allowMembersToAddFines;

        if (parameters.fineVisibility !== 'do-not-update')
            team.settings.fineVisibility = parameters.fineVisibility;

        if (parameters.joinRequestType !== 'do-not-update')
            team.settings.joinRequestType = parameters.joinRequestType;

        if (parameters.currency !== 'do-not-update')
            team.settings.currency = parameters.currency;

        if (parameters.locale !== 'do-not-update')
            team.settings.locale = parameters.locale;

        await Firestore.shared.team(parameters.id).set(team);
    }
}
