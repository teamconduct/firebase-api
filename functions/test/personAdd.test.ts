import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Tagged } from 'firebase-function';
import { testTeam } from './testTeams/testTeam_1';
import { PersonId } from '../src/types';
import { Firestore } from '../src/Firestore';

describe('PersonAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-add');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('person already exists', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('add').callFunction({
            teamId: testTeam.id,
            person: {
                id: testTeam.persons[1].id,
                properties: {
                    firstName: 'Juan',
                    lastName: 'Perez'
                }
            }
        });
        await expect(execute).to.awaitThrow('already-exists');
    });

    it('should add person', async () => {
        const personId: PersonId = Tagged.generate('person');
        await FirebaseApp.shared.functions.function('person').function('add').callFunction({
            teamId: testTeam.id,
            person: {
                id: personId,
                properties: {
                    firstName: 'Juan',
                    lastName: 'Perez'
                }
            }
        });
        const personSnapshot = await Firestore.shared.person(testTeam.id, personId).snapshot();
        expect(personSnapshot.exists).to.be.equal(true);
        expect(personSnapshot.data).to.be.deep.equal({
            id: personId.guidString,
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            },
            fineIds: [],
            signInProperties: null
        });
    });
});
