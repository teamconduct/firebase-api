import { Dictionary, Flattable, ITypeBuilder, Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Team } from './Team';
import { Person } from './Person';

export class User implements Flattable<User.Flatten> {

    public constructor(
        public id: User.Id,
        public teams: Dictionary<Team.Id, User.TeamProperties> = new Dictionary(Team.Id.builder)
    ) {}

    public get flatten(): User.Flatten {
        return {
            id: this.id.flatten,
            teams: this.teams.flatten
        };
    }
}

export namespace User {

    export type Id = Tagged<string, 'user'>;

    export namespace Id {

        export type Flatten = string;

        export const builder = Tagged.builder('user' as const, new ValueTypeBuilder<string>());
    }

    export class TeamProperties implements Flattable<TeamProperties.Flatten> {

        public constructor(
            public name: string,
            public personId: Person.Id
        ) {}

        public get flatten(): TeamProperties.Flatten {
            return {
                name: this.name,
                personId: this.personId.flatten
            };
        }
    }

    export namespace TeamProperties {

        export type Flatten = {
            name: string,
            personId: Person.Id.Flatten
        };

        export class TypeBuilder implements ITypeBuilder<Flatten, TeamProperties> {

            public build(value: Flatten): TeamProperties {
                return new TeamProperties(value.name, Person.Id.builder.build(value.personId));
            }
        }

        export const builder = new TypeBuilder();
    }

    export type Flatten = {
        id: Id.Flatten,
        teams: Dictionary.Flatten<TeamProperties>
    }

    export class TypeBuilder implements ITypeBuilder<Flatten, User> {

        public build(value: Flatten): User {
            return new User(Id.builder.build(value.id), Dictionary.builder(Team.Id.builder, User.TeamProperties.builder).build(value.teams));
        }
    }

    export const builder = new TypeBuilder();
}
