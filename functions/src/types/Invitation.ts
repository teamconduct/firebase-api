import { Flatten, HexBytesCoder, ObjectTypeBuilder, Sha512, Tagged, TaggedTypeBuilder, Utf8BytesCoder, ValueTypeBuilder } from 'firebase-function';
import { TeamId } from './Team';
import { PersonId } from './Person';

export type InvitationId = Tagged<string, 'invitation'>;

export namespace InvitationId {

    export const builder = new TaggedTypeBuilder<string, InvitationId>('invitation', new ValueTypeBuilder());

    export function create(invitation: Invitation): InvitationId {
        const invitationCoder = new Utf8BytesCoder();
        const hasher = new Sha512();
        const idCoder = new HexBytesCoder();
        const teamIdBytes = invitationCoder.encode(invitation.personId.guidString);
        const personIdBytes = invitationCoder.encode(invitation.teamId.guidString);
        const hashedInvitationBytes = hasher.hash(new Uint8Array([...teamIdBytes, ...personIdBytes]));
        const rawId = idCoder.decode(hashedInvitationBytes).slice(0, 12);
        return new Tagged(rawId, 'invitation');
    }
}

export type Invitation = {
    teamId: TeamId
    personId: PersonId
};

export namespace Invitation {
    export const builder = new ObjectTypeBuilder<Flatten<Invitation>, Invitation>({
        teamId: TeamId.builder,
        personId: PersonId.builder
    });
}
