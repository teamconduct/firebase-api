import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team, Currency, Locale } from '../../types';
import { StaticUnionTypeBuilder } from '../../utils';

export namespace TeamUpdateFunction {

    export type Parameters = {
        id: Team.Id
        name: string | 'do-not-update',
        teamLogoUrl: string | 'remove' | 'do-not-update',
        teamSportCategory: string | 'remove' | 'do-not-update',
        teamDescription: string | 'remove' | 'do-not-update',
        paypalMeLink: string | 'remove' | 'do-not-update',
        allowMembersToAddFines: boolean | 'do-not-update',
        fineVisibility: Team.TeamSettings.FineVisibility | 'do-not-update',
        joinRequestType: Team.TeamSettings.JoinRequestType | 'do-not-update',
        currency: Currency | 'do-not-update',
        locale: Locale | 'do-not-update'
    };
}

export class TeamUpdateFunction implements FirebaseFunction<TeamUpdateFunction.Parameters, null> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamUpdateFunction.Parameters>, TeamUpdateFunction.Parameters>({
        id: Team.Id.builder,
        name: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        teamLogoUrl: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        teamSportCategory: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        teamDescription: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        paypalMeLink: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        allowMembersToAddFines: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        fineVisibility: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        joinRequestType: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        currency: StaticUnionTypeBuilder.doNotUpdate(Currency.builder),
        locale: StaticUnionTypeBuilder.doNotUpdate(Locale.builder)
    });

    public returnTypeBuilder = new ValueTypeBuilder<null>();
}
