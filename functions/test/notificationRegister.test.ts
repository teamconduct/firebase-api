import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid, HexBytesCoder, Sha512, Utf8BytesCoder } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';

describe('NotificationRegisterFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('fineTemplate-delete');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    function tokenId(token: string): string {
        const tokenCoder = new Utf8BytesCoder();
        const hasher = new Sha512();
        const idCoder = new HexBytesCoder();
        const tokenBytes = tokenCoder.encode(token);
        const tokenIdBytes = hasher.hash(tokenBytes);
        const tokenId = idCoder.decode(tokenIdBytes);
        return tokenId.slice(0, 16);
    }

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('register').callFunction({
            teamId: testTeam.id,
            personId: Guid.generate(),
            token: 'abc'
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person not signed in', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('register').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[1].id,
            token: 'abc'
        });
        await expect(execute).to.awaitThrow('failed-precondition');
    });

    it('should register notification', async () => {
        await FirebaseApp.shared.functions.function('notification').function('register').callFunction({
            teamId: testTeam.id,
            personId: testTeam.persons[0].id,
            token: 'abc'
        });
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[0].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.equal(true);
        expect(personSnapshot.data.signInProperties?.notificationProperties.tokens[tokenId('abc')]).to.be.equal('abc');
    });
});
