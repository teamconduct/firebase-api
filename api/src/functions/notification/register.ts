import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Person, Team } from '../../types';
import { Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

export namespace NotificationRegisterFunction {

    export type Parameters = {
        teamId: Team.Id,
        personId: Person.Id,
        token: string
    };
}

export class NotificationRegisterFunction implements FirebaseFunction<NotificationRegisterFunction.Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<NotificationRegisterFunction.Parameters>, NotificationRegisterFunction.Parameters>({
        teamId: Team.Id.builder,
        personId: Person.Id.builder,
        token: new ValueTypeBuilder()
    });

    public returnTypeBuilder = new ValueTypeBuilder<void>();
}
