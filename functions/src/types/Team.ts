import { Flatten, Guid, ObjectTypeBuilder, Tagged, TaggedTypeBuilder, TypeBuilder, ValueTypeBuilder } from 'firebase-function';

export type TeamId = Tagged<Guid, 'team'>;

export namespace TeamId {
    export const builder = new TaggedTypeBuilder<string, TeamId>('team', new TypeBuilder(Guid.from));
}

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
