import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { testTeam } from './testTeams/testTeam_1';
import { Firestore } from '../src/Firestore';

describe('PaypalMeEditFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-properties-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        await Firestore.shared.team(testTeam.id).remove();
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
        let teamSnapshot = await Firestore.shared.team(testTeam.id).snapshot();
        expect(teamSnapshot.exists).to.be.equal(true);
        expect(teamSnapshot.data.paypalMeLink).to.be.equal('paypal.me/my-link');

        await FirebaseApp.shared.functions.function('paypalMe').function('edit').callFunction({
            teamId: testTeam.id,
            paypalMeLink: null
        });
        teamSnapshot = await Firestore.shared.team(testTeam.id).snapshot();
        expect(teamSnapshot.exists).to.be.equal(true);
        expect(teamSnapshot.data.paypalMeLink).to.be.equal(null);
    });
});
