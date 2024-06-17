import * as functions from 'firebase-functions';
import { FirebaseFunction, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder, Flatten, Utf8BytesCoder, Sha512, HexBytesCoder } from 'firebase-function';
import { Person } from '../types';
import { Firestore } from '../Firestore';

export type Parameters = {
    teamId: Guid,
    personId: Guid,
    token: string
}

export class NotificationRegisterFunction implements FirebaseFunction<Parameters, void> {

    public parametersBuilder = new ObjectTypeBuilder<Flatten<Parameters>, Parameters>({
        teamId: new TypeBuilder(Guid.from),
        personId: new TypeBuilder(Guid.from),
        token: new ValueTypeBuilder()
    });

    public constructor(
        _userId: string | null,
        private readonly logger: ILogger
    ) {
        this.logger.log('NotificationRegisterFunction.constructor', null, 'notice');
    }

    private tokenId(token: string): string {
        const tokenCoder = new Utf8BytesCoder();
        const hasher = new Sha512();
        const idCoder = new HexBytesCoder();
        const tokenBytes = tokenCoder.encode(token);
        const tokenIdBytes = hasher.hash(tokenBytes);
        const tokenId = idCoder.decode(tokenIdBytes);
        return tokenId.slice(0, 16);
    }

    public async execute(parameters: Parameters): Promise<void> {
        this.logger.log('NotificationRegisterFunction.execute');

        const personSnapshot = await Firestore.shared.person(parameters.teamId, parameters.personId).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');
        const person = Person.builder.build(personSnapshot.data, this.logger.nextIndent);

        if (person.signInProperties === null)
            throw new functions.https.HttpsError('failed-precondition', 'Person not signed in');

        const tokenId = this.tokenId(parameters.token);
        person.signInProperties.notificationProperties.tokens[tokenId] = parameters.token;
        await Firestore.shared.person(parameters.teamId, parameters.personId).set(person);
    }
}
