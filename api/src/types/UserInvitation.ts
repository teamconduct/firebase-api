import { BytesCoder, Flattable, ITypeBuilder, Sha512, Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Team } from './Team';
import { Person } from './Person';

export class UserInvitation implements Flattable<UserInvitation.Flatten> {

    constructor(
        public teamId: Team.Id,
        public personId: Person.Id
    ) {}

    public createId(): UserInvitation.Id {
        const hasher = new Sha512();
        const teamIdBytes = BytesCoder.fromUtf8(this.teamId.guidString);
        const personIdBytes = BytesCoder.fromUtf8(this.personId.guidString);
        const hashedInvitationBytes = hasher.hash(new Uint8Array([...teamIdBytes, ...personIdBytes]));
        const rawId = BytesCoder.toHex(hashedInvitationBytes).slice(0, 12);
        return new Tagged(rawId, 'userInvitation');
    }

    public get flatten(): UserInvitation.Flatten {
        return {
            teamId: this.teamId.flatten,
            personId: this.personId.flatten
        };
    }
}

export namespace UserInvitation {

    export type Id = Tagged<string, 'userInvitation'>;

    export namespace Id {

        export type Flatten = string;

        export const builder = Tagged.builder('userInvitation' as const, new ValueTypeBuilder<string>());
    }

    export type Flatten = {
        teamId: Team.Id.Flatten,
        personId: Person.Id.Flatten
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, UserInvitation> {

        public build(value: Flatten): UserInvitation {
            return new UserInvitation(
                Team.Id.builder.build(value.teamId),
                Person.Id.builder.build(value.personId)
            );
        }
    }

    export const builder = new TypeBuilder();
}
