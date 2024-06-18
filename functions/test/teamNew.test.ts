import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { expect } from 'firebase-function/lib/src/testSrc';
import { testTeam } from './testTeams/testTeam_1';
import { PersonId, UserId, UserRole } from '../src/types';
import { TeamId } from '../src/types/Team';
import { Firestore } from '../src/Firestore';

describe('TeamNewFunction', () => {

    let userId: UserId;

    beforeEach(async () => {
        userId = await FirebaseApp.shared.addTestTeam();
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('should throw an error if user is not authenticated', async () => {
        await FirebaseApp.shared.auth.signOut();
        const execute = async () => await FirebaseApp.shared.functions.function('team').function('new').callFunction({
            id: Tagged.generate('team'),
            name: 'Test Team',
            paypalMeLink: null,
            personId: Tagged.generate('person'),
            personProperties: {
                firstName: 'Test',
                lastName: 'Person'
            }
        });
        await expect(execute).to.awaitThrow('permission-denied');
    });

    it('should throw an error if team already exists', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('team').function('new').callFunction({
            id: testTeam.id,
            name: 'Test Team',
            paypalMeLink: null,
            personId: Tagged.generate('person'),
            personProperties: {
                firstName: 'Test',
                lastName: 'Person'
            }
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('should create a new team existing user', async () => {
        const teamId: TeamId = Tagged.generate('team');
        const personId: PersonId = Tagged.generate('person');
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
        const userSnpapshot = await Firestore.shared.user(userId).snapshot();
        expect(userSnpapshot.exists).to.be.equal(true);
        expect(teamId.guidString in userSnpapshot.data.teams).to.be.equal(true);
        const userTeam = userSnpapshot.data.teams[teamId.guidString];
        expect(userTeam).to.be.deep.equal({
            personId: personId.guidString,
            roles: UserRole.all
        });
        const teamSnapshot = await Firestore.shared.team(teamId).snapshot();
        expect(teamSnapshot.exists).to.be.equal(true);
        expect(teamSnapshot.data).to.be.deep.equal({
            name: 'Test Team',
            paypalMeLink: null
        });
        const personSnapshot = await Firestore.shared.person(teamId, personId).snapshot();
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
                userId: userId.value,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                signInDate: personSnapshot.data.signInProperties!.signInDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                }
            }
        });
    });

    it('should create a new team not exiting user', async () => {
        const teamId: TeamId = Tagged.generate('team');
        const personId: PersonId = Tagged.generate('person');
        await Firestore.shared.user(userId).remove();
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
        const userSnpapshot = await Firestore.shared.user(userId).snapshot();
        expect(userSnpapshot.exists).to.be.equal(true);
        expect(teamId.guidString in userSnpapshot.data.teams).to.be.equal(true);
        const userTeam = userSnpapshot.data.teams[teamId.guidString];
        expect(userTeam).to.be.deep.equal({
            personId: personId.guidString,
            roles: UserRole.all
        });
        const teamSnapshot = await Firestore.shared.team(teamId).snapshot();
        expect(teamSnapshot.exists).to.be.equal(true);
        expect(teamSnapshot.data).to.be.deep.equal({
            name: 'Test Team',
            paypalMeLink: null
        });
        const personSnapshot = await Firestore.shared.person(teamId, personId).snapshot();
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
                userId: userId.value,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                signInDate: personSnapshot.data.signInProperties!.signInDate,
                notificationProperties: {
                    tokens: {},
                    subscriptions: []
                }
            }
        });
    });
});
