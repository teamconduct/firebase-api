import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';

describe('PaypalMeEditFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-properties-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).remove();
        const execute = async () => await FirebaseApp.shared.functions.function('paypalMe').function('edit').callFunction({
            teamId: testTeam.id,
            paypalMeLink: 'https://paypal.me/TeamPropertiesManager'
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('add and remove paypalMeLink', async () => {
        await FirebaseApp.shared.functions.function('paypalMe').function('edit').callFunction({
            teamId: testTeam.id,
            paypalMeLink: 'paypal.me/my-link'
        });
        let teamSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).snapshot();
        expect(teamSnapshot.exists).to.be.equal(true);
        expect(teamSnapshot.data.paypalMeLink).to.be.equal('paypal.me/my-link');

        await FirebaseApp.shared.functions.function('paypalMe').function('edit').callFunction({
            teamId: testTeam.id,
            paypalMeLink: null
        });
        teamSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).snapshot();
        expect(teamSnapshot.exists).to.be.equal(true);
        expect(teamSnapshot.data.paypalMeLink).to.be.equal(null);
    });
});
