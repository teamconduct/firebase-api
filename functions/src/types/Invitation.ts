import { Flatten, Guid, HexBytesCoder, ObjectTypeBuilder, Sha512, TypeBuilder, Utf8BytesCoder } from 'firebase-function';

export type Invitation = {
    teamId: Guid
    personId: Guid
};

export namespace Invitation {
    export const builder = new ObjectTypeBuilder<Flatten<Invitation>, Invitation>({
        teamId: new TypeBuilder(Guid.from),
        personId: new TypeBuilder(Guid.from)
    });

    export function createId(invitation: Invitation): string {
        const invitationCoder = new Utf8BytesCoder();
        const hasher = new Sha512();
        const idCoder = new HexBytesCoder();
        const teamIdBytes = invitationCoder.encode(invitation.personId.guidString);
        const personIdBytes = invitationCoder.encode(invitation.teamId.guidString);
        const hashedInvitationBytes = hasher.hash(new Uint8Array([...teamIdBytes, ...personIdBytes]));
        return idCoder.decode(hashedInvitationBytes).slice(0, 12);
    }
}
