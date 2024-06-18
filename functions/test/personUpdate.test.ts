import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { Firestore } from '../src/Firestore';

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
                id: Tagged.generate('person'),
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
        const personSnapshot = await Firestore.shared.person(testTeam.id, testTeam.persons[1].id).snapshot();
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
