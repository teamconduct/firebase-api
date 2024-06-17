import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';

describe('PersonUpdateFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-update');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('update').callFunction({
            teamId: testTeam.id,
            person: {
                id: Guid.generate(),
                properties: {
                    firstName: 'Juan',
                    lastName: 'Perez'
                }
            }
        });
        await expect(execute).to.awaitThrow('not-found');
    });

    it('should update person', async () => {
        await FirebaseApp.shared.functions.function('person').function('update').callFunction({
            teamId: testTeam.id,
            person: {
                id: testTeam.persons[1].id,
                properties: {
                    firstName: 'Juan',
                    lastName: 'Perez'
                }
            }
        });
        const personSnapshot = await FirebaseApp.shared.firestore.collection('teams').document(testTeam.id.guidString).collection('persons').document(testTeam.persons[1].id.guidString).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            id: testTeam.persons[1].id.guidString,
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            },
            fineIds: personSnapshot.data.fineIds,
            signInProperties: personSnapshot.data.signInProperties
        });
    });
});
