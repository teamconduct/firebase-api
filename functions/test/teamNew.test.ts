import { describe, it } from 'mocha';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { expect } from 'firebase-function/lib/src/testSrc';
import { testTeam1 } from './testTeams/testTeam_1';
import { UserRole } from '../src/types';

describe('TeamNewFunction', () => {

    let userId: string;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam();
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('should throw an error if user is not authenticated', async () => {
        await FirebaseApp.shared.auth.signOut();
        const execute = async () => await FirebaseApp.shared.functions.function('team').function('new').callFunction({
            id: Guid.generate(),
            name: 'Test Team',
            paypalMeLink: null,
            personId: Guid.generate(),
            personProperties: {
                firstName: 'Test',
                lastName: 'Person'
            }
        });
        expect(execute).to.awaitThrow('permission-denied');
    });

    it('should throw an error if team already exists', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('team').function('new').callFunction({
            id: testTeam1.id,
            name: 'Test Team',
            paypalMeLink: null,
            personId: Guid.generate(),
            personProperties: {
                firstName: 'Test',
                lastName: 'Person'
            }
        });
        expect(execute).to.awaitThrow('already-exists');
    });

    it('should create a new team', async () => {
        const teamId = Guid.generate();
        const personId = Guid.generate();
        await FirebaseApp.shared.functions.function('team').function('new').callFunction({
            id: teamId,
            name: 'Test Team',
            paypalMeLink: null,
            personId: personId,
            personProperties: {
                firstName: 'Test',
                lastName: 'Person'
            }
        });
        const userSnpapshot = await FirebaseApp.shared.firestore.getSubCollection('users').getDocument(userId).snapshot();
        expect(userSnpapshot.exists).to.be.equal(true);
        const userTeam = userSnpapshot.data.teams.find(team => team.id === teamId.guidString);
        expect(userTeam).to.be.deep.equal({
            id: teamId.guidString,
            personId: personId.guidString,
            roles: UserRole.all
        });
        const teamSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(teamId.guidString).snapshot();
        expect(teamSnapshot.exists).to.be.equal(true);
        expect(teamSnapshot.data).to.be.deep.equal({
            name: 'Test Team',
            paypalMeLink: null
        });
        const personSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(teamId.guidString).getSubCollection('persons').getDocument(personId.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data.signInProperties !== null).to.be.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            id: personId.guidString,
            properties: {
                firstName: 'Test',
                lastName: 'Person'
            },
            fineIds: [],
            signInProperties: {
                userId: userId,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                signInDate: personSnapshot.data.signInProperties!.signInDate,
                notificationTokens: {}
            }
        });
    });
});
