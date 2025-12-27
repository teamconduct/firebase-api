import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, PersonPrivateProperties, User, Team } from '../../types';

export type TeamNewFunctionParameters = {
    id: Team.Id
    name: string
    paypalMeLink: string | null
    personId: Person.Id
    personProperties: PersonPrivateProperties
};

export abstract class TeamNewFunctionBase extends FirebaseFunction<TeamNewFunctionParameters, User> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<TeamNewFunctionParameters>, TeamNewFunctionParameters>({
        id: Team.Id.builder,
        name: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder(),
        personId: Person.Id.builder,
        personProperties: PersonPrivateProperties.builder
    });

    public returnTypeBuilder = User.builder;
}
