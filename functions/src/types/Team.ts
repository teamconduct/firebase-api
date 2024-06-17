import { Flatten, ObjectTypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type Team = {
    name: string,
    paypalMeLink: string | null
}

export namespace Team {
    export const builder = new ObjectTypeBuilder<Flatten<Team>, Team>({
        name: new ValueTypeBuilder(),
        paypalMeLink: new ValueTypeBuilder()
    });
}
