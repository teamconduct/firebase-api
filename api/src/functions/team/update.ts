import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team, Currency, Locale } from '../../types';
import { StaticUnionTypeBuilder } from '../../utils';

export namespace TeamUpdateFunction {

    export type Parameters = {
        id: Team.Id
        name: string | 'do-not-update',
        logoUrl: string | 'remove' | 'do-not-update',
        sportCategory: string | 'remove' | 'do-not-update',
        description: string | 'remove' | 'do-not-update',
        paypalMeLink: string | 'remove' | 'do-not-update',
        allowMembersToAddFines: boolean | 'do-not-update',
        fineVisibility: Team.Settings.FineVisibility | 'do-not-update',
        joinRequestType: Team.Settings.JoinRequestType | 'do-not-update',
        currency: Currency | 'do-not-update',
        locale: Locale | 'do-not-update'
    };
}

export class TeamUpdateFunction implements FirebaseFunction<TeamUpdateFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamUpdateFunction.Parameters>, TeamUpdateFunction.Parameters>({
        id: Team.Id.builder,
        name: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        logoUrl: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        sportCategory: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        description: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        paypalMeLink: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        allowMembersToAddFines: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        fineVisibility: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        joinRequestType: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        currency: StaticUnionTypeBuilder.doNotUpdate(Currency.builder),
        locale: StaticUnionTypeBuilder.doNotUpdate(Locale.builder)
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
