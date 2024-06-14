import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';

describe('PersonUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-update');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('update').callFunction({
            teamId: Guid.generate(),
            id: Guid.generate(),
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            }
        });
        expect(execute()).to.awaitThrow('not-found');
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('update').callFunction({
            teamId: testTeam1.id,
            id: Guid.generate(),
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            }
        });
        expect(execute()).to.awaitThrow('not-found');
    });

    it('should update person', async () => {
        await FirebaseApp.shared.functions.function('person').function('update').callFunction({
            teamId: testTeam1.id,
            id: testTeam1.persons[1].id,
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            }
        });
        const personSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('persons').getDocument(testTeam1.persons[1].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            id: testTeam1.persons[1].id.guidString,
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            },
            fineIds: personSnapshot.data.fineIds,
            signInProperties: personSnapshot.data.signInProperties
        });
    });
});
