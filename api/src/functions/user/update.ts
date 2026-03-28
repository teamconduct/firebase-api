import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { NotificationProperties } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { StaticUnionTypeBuilder } from '../../utils';

export namespace UserUpdateFunction {

    export type Parameters = {
        name: {
            firstName: string,
            lastName: string
        } | 'do-not-update',
        bio: string | 'remove' | 'do-not-update',
        profilePictureUrl: string | 'remove' | 'do-not-update',
        notificationSubscriptions: NotificationProperties.Subscription[] | 'do-not-update'
    };
}

export class UserUpdateFunction implements FirebaseFunction<UserUpdateFunction.Parameters, null> {

    public parametersBuilder = new ObjectTypeBuilder<Flattable.Flatten<UserUpdateFunction.Parameters>, UserUpdateFunction.Parameters>({
        name: StaticUnionTypeBuilder.doNotUpdate(new ValueTypeBuilder()),
        bio: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        profilePictureUrl: StaticUnionTypeBuilder.doNotUpdateRemove(new ValueTypeBuilder()),
        notificationSubscriptions: StaticUnionTypeBuilder.doNotUpdate(new ArrayTypeBuilder(new ValueTypeBuilder()))
    });

    public returnTypeBuilder = new ValueTypeBuilder<null>();
}
