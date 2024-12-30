import { Flattable, Guid, ITypeBuilder, Tagged } from '@stevenkellner/typescript-common-functionality';

export class Team implements Flattable<Team.Flatten> {

    public constructor(
        public id: Team.Id,
        public name: string,
        public paypalMeLink: string | null
    ) {}

    public get flatten(): Team.Flatten {
        return {
            id: this.id.flatten,
            name: this.name,
            paypalMeLink: this.paypalMeLink
        };
    }
}

export namespace Team {

    export type Id = Tagged<Guid, 'team'>;

    export namespace Id {

        export type Flatten = string;

        export const builder = Tagged.builder('team' as const, Guid.builder);
    }

    export type Flatten = {
        id: Id.Flatten,
        name: string,
        paypalMeLink: string | null
    }

    export class TypeBuilder implements ITypeBuilder<Flatten, Team> {

        public build(value: Flatten): Team {
            return new Team(
                Id.builder.build(value.id),
                value.name,
                value.paypalMeLink
            );
        }
    }

    export const builder = new TypeBuilder();
}
