import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { NotificationProperties } from '../../types';
import { ArrayTypeBuilder, Flattable, ObjectTypeBuilder, UnionTypeBuilder, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';

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
        name: new ValueTypeBuilder(),
        bio: new ValueTypeBuilder(),
        profilePictureUrl: new ValueTypeBuilder(),
        notificationSubscriptions: new UnionTypeBuilder(value => value === 'do-not-update' ? 'T2' : 'T1', new ArrayTypeBuilder(new ValueTypeBuilder()), new ValueTypeBuilder())
    });

    public returnTypeBuilder = new ValueTypeBuilder<null>();
}
