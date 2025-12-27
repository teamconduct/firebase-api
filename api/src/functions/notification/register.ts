import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export type NotificationRegisterFunctionParameters = {
    teamId: Team.Id,
    personId: Person.Id,
    token: string
}

export abstract class NotificationRegisterFunctionBase extends FirebaseFunction<NotificationRegisterFunctionParameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<NotificationRegisterFunctionParameters>, NotificationRegisterFunctionParameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        token: new ValueTypeBuilder()
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
