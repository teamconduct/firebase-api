import { expect } from '@assertive-ts/core';
import { FirebaseApp } from '../../FirebaseApp';
import { Result } from '@stevenkellner/typescript-common-functionality';
import { FunctionsError } from '@stevenkellner/firebase-function';

describe('PaypalMeEditFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('team-manager');
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    it('team not found', async () => {
        await FirebaseApp.shared.firestore.team(FirebaseApp.shared.testTeam.id).remove();
        const result = await FirebaseApp.shared.functions.paypalMe.edit.executeWithResult({
            teamId: FirebaseApp.shared.testTeam.id,
            paypalMeLink: 'https://paypal.me/TeamPropertiesManager'
        });
        expect(result).toBeEqual(Result.failure(new FunctionsError('not-found', 'Team not found')));
    });

    it('add and remove paypalMeLink', async () => {
        await FirebaseApp.shared.functions.paypalMe.edit.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            paypalMeLink: 'paypal.me/my-link'
        });
        let teamSnapshot = await FirebaseApp.shared.firestore.team(FirebaseApp.shared.testTeam.id).snapshot();
        expect(teamSnapshot.exists).toBeTrue();
        expect(teamSnapshot.data.paypalMeLink).toBeEqual('paypal.me/my-link');

        await FirebaseApp.shared.functions.paypalMe.edit.execute({
            teamId: FirebaseApp.shared.testTeam.id,
            paypalMeLink: null
        });
        teamSnapshot = await FirebaseApp.shared.firestore.team(FirebaseApp.shared.testTeam.id).snapshot();
        expect(teamSnapshot.exists).toBeTrue();
        expect(teamSnapshot.data.paypalMeLink).toBeEqual(null);
    });
});
