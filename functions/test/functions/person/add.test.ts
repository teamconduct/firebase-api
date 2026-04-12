import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from '@assertive-ts/core';
import { Person, PersonProperties } from '@stevenkellner/team-conduct-api';
import { expectThrowsFunctionsError } from '../../firebase/firebase-utils';
import { FirebaseApp } from '../../FirebaseApp/FirebaseApp';
import { RandomData } from '../../utils/RandomData';

describe('person/add', () => {
    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
        await FirebaseApp.shared.auth.signOut();
    });

    describe('given the user is not authenticated', () => {
        it('should throw an unauthenticated error', async () => {
            await FirebaseApp.shared.auth.signOut();
            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.add.execute({
                    teamId: RandomData.shared.teamId(),
                    id: RandomData.shared.personId(),
                    properties: new PersonProperties('Alice', 'Smith', null)
                }),
                'unauthenticated'
            );
        });
    });

    describe('given the user does not have the required role', () => {
        it('should throw a permission-denied error', async () => {
            await FirebaseApp.shared.addTestTeam('fine-manager');
            const testTeam = FirebaseApp.shared.testTeam;

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.add.execute({
                    teamId: testTeam.id,
                    id: RandomData.shared.personId(),
                    properties: new PersonProperties('Alice', 'Smith', null)
                }),
                'permission-denied'
            );
        });
    });

    describe('given the person already exists', () => {
        it('should throw an already-exists error', async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
            const testTeam = FirebaseApp.shared.testTeam;
            const existingPerson = testTeam.persons[1];

            await expectThrowsFunctionsError(
                () => FirebaseApp.shared.functions.person.add.execute({
                    teamId: testTeam.id,
                    id: existingPerson.id,
                    properties: existingPerson.properties
                }),
                'already-exists',
                'Person already exists'
            );
        });
    });

    describe('given a valid team-manager and a new person', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('team-manager');
        });

        it('should create the person document', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const newPersonId = RandomData.shared.personId();
            const newProperties = new PersonProperties('Alice', 'Smith', null);

            await FirebaseApp.shared.functions.person.add.execute({
                teamId: testTeam.id,
                id: newPersonId,
                properties: newProperties
            });

            const personSnapshot = await FirebaseApp.shared.firestore.person(testTeam.id, newPersonId).snapshot();
            expect(personSnapshot.exists).toBeTrue();
            const created = Person.builder.build(personSnapshot.data);
            expect(created.properties.firstName).toBeEqual('Alice');
            expect(created.properties.lastName).toBeEqual('Smith');
            expect(created.signInProperties).toBeNull();
        });
    });

    describe('given a valid person-manager and a new person', () => {
        beforeEach(async () => {
            await FirebaseApp.shared.addTestTeam('person-manager');
        });

        it('should create the person document using person-manager role', async () => {
            const testTeam = FirebaseApp.shared.testTeam;
            const newPersonId = RandomData.shared.personId();

            await FirebaseApp.shared.functions.person.add.execute({
                teamId: testTeam.id,
                id: newPersonId,
                properties: new PersonProperties('Bob', 'Jones', null)
            });

            const personSnapshot = await FirebaseApp.shared.firestore.person(testTeam.id, newPersonId).snapshot();
            expect(personSnapshot.exists).toBeTrue();
        });
    });
});
