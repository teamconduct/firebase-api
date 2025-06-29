import { BytesCoder, Flattable, ITypeBuilder, OptionalTypeBuilder, Sha512, Tagged, ValueTypeBuilder } from '@stevenkellner/typescript-common-functionality';
import { Team } from './Team';
import { Person } from './Person';

export class Invitation implements Flattable<Invitation.Flatten> {

    constructor(
        public teamId: Team.Id,
        public personId: Person.Id | null
    ) {}

    public createId(): Invitation.Id {
        const hasher = new Sha512();
        const teamIdBytes = BytesCoder.fromUtf8(this.teamId.guidString);
        let invitationBytes = teamIdBytes;
        if (this.personId !== null) {
            const personIdBytes = BytesCoder.fromUtf8(this.personId.guidString);
            invitationBytes = new Uint8Array([...teamIdBytes, ...personIdBytes]);
        }
        const hashedInvitationBytes = hasher.hash(invitationBytes);
        const rawId = BytesCoder.toHex(hashedInvitationBytes).slice(0, 12);
        return new Tagged(rawId, 'invitation');
    }

    public get flatten(): Invitation.Flatten {
        return {
            teamId: this.teamId.flatten,
            personId: this.personId !== null ? this.personId.flatten : null
        };
    }
}

export namespace Invitation {

    export type Id = Tagged<string, 'invitation'>;

    export namespace Id {

        export type Flatten = string;

        export const builder = Tagged.builder('invitation' as const, new ValueTypeBuilder<string>());
    }

    export type Flatten = {
        teamId: Team.Id.Flatten,
        personId: Person.Id.Flatten | null
    };

    export class TypeBuilder implements ITypeBuilder<Flatten, Invitation> {

        public build(value: Flatten): Invitation {
            return new Invitation(
                Team.Id.builder.build(value.teamId),
                new OptionalTypeBuilder(Person.Id.builder).build(value.personId)
            );
        }
    }

    export const builder = new TypeBuilder();
}
