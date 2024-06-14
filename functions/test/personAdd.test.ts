import { expect } from 'firebase-function/lib/src/testSrc';
import { FirebaseApp } from './FirebaseApp';
import { Guid } from 'firebase-function';
import { testTeam1 } from './testTeams/testTeam_1';

describe('PersonAddFunction', () => {

    beforeEach(async () => {
        await FirebaseApp.shared.addTestTeam('person-add');
    });

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    it('team not found', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('add').callFunction({
            teamId: Guid.generate().guidString,
            id: Guid.generate().guidString,
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            }
        });
        expect(execute()).to.awaitThrow();
    });

    it('person already exists', async () => {
        const execute = async () => await FirebaseApp.shared.functions.function('person').function('add').callFunction({
            teamId: testTeam1.id.guidString,
            id: testTeam1.persons[1].id.guidString,
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            }
        });
        expect(execute()).to.awaitThrow();
    });

    it('should add person', async () => {
        const personId = Guid.generate();
        await FirebaseApp.shared.functions.function('person').function('add').callFunction({
            teamId: testTeam1.id.guidString,
            id: personId.guidString,
            properties: {
                firstName: 'Juan',
                lastName: 'Perez'
            }
        });
        const personSnapshot = await FirebaseApp.shared.firestore.getSubCollection('teams').getDocument(testTeam1.id.guidString).getSubCollection('persons').getDocument(personId.guidString).snapshot();
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
