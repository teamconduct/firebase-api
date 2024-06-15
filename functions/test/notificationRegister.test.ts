import * as admin from 'firebase-admin';
import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid, HexBytesCoder, Sha512, Utf8BytesCoder } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';

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

    it('team not found', async () => {
        await admin.app().firestore().collection('teams').doc(testTeam1.id.guidString).delete();
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('register').callFunction({
            teamId: testTeam1.id,
            personId: Guid.generate(),
            token: 'abc'
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('register').callFunction({
            teamId: testTeam1.id,
            personId: Guid.generate(),
            token: 'abc'
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('person not signed in', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('notification').function('register').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[1].id,
            token: 'abc'
        });
        await expect(execute).to.awaitThrow('failed-precondition');
    });

    it('should register notification', async () => {
        await FirebaseApp.shared.functions.function('notification').function('register').callFunction({
            teamId: testTeam1.id,
            personId: testTeam1.persons[0].id,
            token: 'abc'
        });
        const personSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('persons').getDocument(testTeam1.persons[0].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.equal(true);
        expect(personSnapshot.data.signInProperties?.notificationProperties.tokens[tokenId('abc')]).to.be.equal('abc');
    });
});
