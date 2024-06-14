import { Flatten, ObjectTypeBuilder, RecordTypeBuilder, TypeBuilder, UtcDate, ValueTypeBuilder } from 'firebase-function';

export type PersonSignInProperties = {
    userId: string
    signInDate: UtcDate
    notificationTokens: Record<string, string>
}

export namespace PersonSignInProperties {
    export const builder = new ObjectTypeBuilder<Flatten<PersonSignInProperties>, PersonSignInProperties>({
        userId: new ValueTypeBuilder(),
        signInDate: new TypeBuilder(UtcDate.decode),
        notificationTokens: new RecordTypeBuilder(new ValueTypeBuilder())
    });
}
