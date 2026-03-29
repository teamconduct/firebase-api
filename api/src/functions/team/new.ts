import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Team, Currency, Locale, Person } from '../../types';

export namespace TeamNewFunction {

    export type Parameters = {
        id: Team.Id,
        teamPersonId: Person.Id,
        name: string,
        teamLogoUrl: string | null,
        teamSportCategory: string | null,
        teamDescription: string | null,
        paypalMeLink: string | null,
        currency: Currency,
        locale: Locale
    };
}

export class TeamNewFunction implements FirebaseFunction<TeamNewFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamNewFunction.Parameters>, TeamNewFunction.Parameters>({
        id: Team.Id.builder,
        teamPersonId: Person.Id.builder,
        name: new ValueTypeBuilder(),
        teamLogoUrl: new ValueTypeBuilder(),
        teamSportCategory: new ValueTypeBuilder(),
        teamDescription: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder(),
        currency: Currency.builder,
        locale: Locale.builder
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
