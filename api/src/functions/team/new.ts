import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, User, Team } from '../../types';

export namespace TeamNewFunction {

    export type Parameters = {
        id: Team.Id
        name: string
        paypalMeLink: string | null
        personId: Person.Id
        personProperties: PersonPrivateProperties
    };
}

export class TeamNewFunction implements FirebaseFunction<TeamNewFunction.Parameters, User> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamNewFunction.Parameters>, TeamNewFunction.Parameters>({
        id: Team.Id.builder,
        name: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder(),
        personId: Person.Id.builder,
        personProperties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = User.builder;
}
