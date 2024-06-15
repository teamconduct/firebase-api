import * as functions from 'firebase-functions';
import { FirebaseFunction, Guid, ILogger, ObjectTypeBuilder, TypeBuilder, ValueTypeBuilder, Flatten, Utf8BytesCoder, Sha512, HexBytesCoder } from 'firebase-function';
import { firestoreBase } from '../firestoreBase';
import { PersonSignInProperties } from '../types';

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

        const teamSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).snapshot();
        if (!teamSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Team not found');

        const personSnapshot = await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).snapshot();
        if (!personSnapshot.exists)
            throw new functions.https.HttpsError('not-found', 'Person not found');

        const person = personSnapshot.data;
        if (person.signInProperties === null)
            throw new functions.https.HttpsError('failed-precondition', 'Person not signed in');

        const tokenId = this.tokenId(parameters.token);
        person.signInProperties.notificationProperties.tokens[tokenId] = parameters.token;
        await firestoreBase.getSubCollection('teams').getDocument(parameters.teamId.guidString).getSubCollection('persons').getDocument(parameters.personId.guidString).setValues({
            signInProperties: PersonSignInProperties.builder.build(person.signInProperties, this.logger.nextIndent)
        });
    }
}
