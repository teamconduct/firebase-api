import { expect } from '@assertive-ts/core';
import { Invitation } from '../../src/types/Invitation';
import { Team } from '../../src/types/Team';
import { Person } from '../../src/types/Person';

describe('Invitation', () => {

    describe('Invitation.Id', () => {

        describe('Invitation.Id type', () => {

            it('should create a valid invitation ID', () => {
                const invitationId = Invitation.Id.builder.build('a1b2c3d4e5f6');
                expect(invitationId.value).toBeEqual('a1b2c3d4e5f6');
            });

            it('should have 12 character hex string', () => {
                const invitationId = Invitation.Id.builder.build('123456789abc');
                expect(invitationId.value.length).toBeEqual(12);
            });
        });

        describe('Invitation.Id.builder', () => {

            it('should build invitation ID from string', () => {
                const idString = 'a1b2c3d4e5f6';
                const invitationId = Invitation.Id.builder.build(idString);
                expect(invitationId.flatten).toBeEqual(idString);
            });

            it('should preserve invitation ID value', () => {
                const idString = '123456789abc';
                const invitationId = Invitation.Id.builder.build(idString);
                expect(invitationId.flatten).toBeEqual(idString);
            });

            it('should build different invitation IDs', () => {
                const id1 = Invitation.Id.builder.build('aaa111bbb222');
                const id2 = Invitation.Id.builder.build('ccc333ddd444');
                expect(id1.flatten).not.toBeEqual(id2.flatten);
            });
        });
    });

    describe('Invitation', () => {

        describe('Invitation constructor', () => {

            it('should create invitation with team ID and null person ID', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                expect(invitation.teamId).toBeEqual(teamId);
                expect(invitation.personId).toBeEqual(null);
            });

            it('should create invitation with team ID and person ID', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation = new Invitation(teamId, personId);
                expect(invitation.teamId).toBeEqual(teamId);
                expect(invitation.personId).toBeEqual(personId);
            });

            it('should create team-wide invitation', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                expect(invitation.personId).toBeEqual(null);
            });

            it('should create person-specific invitation', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation = new Invitation(teamId, personId);
                expect(invitation.personId).not.toBeEqual(null);
            });
        });

        describe('Invitation.createId', () => {

            it('should create invitation ID from team-wide invitation', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                const invitationId = invitation.createId();
                expect(invitationId.flatten.length).toBeEqual(12);
            });

            it('should create invitation ID from person-specific invitation', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation = new Invitation(teamId, personId);
                const invitationId = invitation.createId();
                expect(invitationId.flatten.length).toBeEqual(12);
            });

            it('should create consistent IDs for same team-wide invitation', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation1 = new Invitation(teamId, null);
                const invitation2 = new Invitation(teamId, null);
                const id1 = invitation1.createId();
                const id2 = invitation2.createId();
                expect(id1.flatten).toBeEqual(id2.flatten);
            });

            it('should create consistent IDs for same person-specific invitation', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation1 = new Invitation(teamId, personId);
                const invitation2 = new Invitation(teamId, personId);
                const id1 = invitation1.createId();
                const id2 = invitation2.createId();
                expect(id1.flatten).toBeEqual(id2.flatten);
            });

            it('should create different IDs for different teams', () => {
                const teamId1 = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const teamId2 = Team.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation1 = new Invitation(teamId1, null);
                const invitation2 = new Invitation(teamId2, null);
                const id1 = invitation1.createId();
                const id2 = invitation2.createId();
                expect(id1.flatten).not.toBeEqual(id2.flatten);
            });

            it('should create different IDs for different persons', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId1 = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const personId2 = Person.Id.builder.build('c3333333-3333-4333-3333-333333333333');
                const invitation1 = new Invitation(teamId, personId1);
                const invitation2 = new Invitation(teamId, personId2);
                const id1 = invitation1.createId();
                const id2 = invitation2.createId();
                expect(id1.flatten).not.toBeEqual(id2.flatten);
            });

            it('should create different IDs for team-wide vs person-specific', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation1 = new Invitation(teamId, null);
                const invitation2 = new Invitation(teamId, personId);
                const id1 = invitation1.createId();
                const id2 = invitation2.createId();
                expect(id1.flatten).not.toBeEqual(id2.flatten);
            });

            it('should create hex string IDs', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                const invitationId = invitation.createId();
                const hexPattern = /^[0-9a-f]{12}$/;
                expect(hexPattern.test(invitationId.flatten)).toBeTrue();
            });

            it('should create IDs with exactly 12 characters', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation = new Invitation(teamId, personId);
                const invitationId = invitation.createId();
                expect(invitationId.flatten.length).toBeEqual(12);
            });

            it('should create tagged invitation ID', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                const invitationId = invitation.createId();
                expect(invitationId.tag).toBeEqual('invitation');
            });
        });

        describe('Invitation.flatten', () => {

            it('should return flattened representation with null person ID', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                const flattened = invitation.flatten;
                expect(flattened.teamId).toBeEqual(teamId.flatten);
                expect(flattened.personId).toBeEqual(null);
            });

            it('should return flattened representation with person ID', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation = new Invitation(teamId, personId);
                const flattened = invitation.flatten;
                expect(flattened.teamId).toBeEqual(teamId.flatten);
                expect(flattened.personId).toBeEqual(personId.flatten);
            });

            it('should match original values', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const invitation = new Invitation(teamId, personId);
                const flattened = invitation.flatten;
                expect(flattened.teamId).toBeEqual(invitation.teamId.flatten);
                expect(flattened.personId).toBeEqual(invitation.personId?.flatten ?? null);
            });

            it('should have correct structure', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                const flattened = invitation.flatten;
                expect(typeof flattened.teamId).toBeEqual('string');
                expect(flattened.personId === null || typeof flattened.personId === 'string').toBeTrue();
            });

            it('should flatten team-wide invitation correctly', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const invitation = new Invitation(teamId, null);
                const flattened = invitation.flatten;
                expect(flattened.personId).toBeEqual(null);
            });
        });

        describe('Invitation.TypeBuilder', () => {

            it('should build invitation from flattened data with null person ID', () => {
                const flattened = {
                    teamId: 'a1111111-1111-4111-1111-111111111111',
                    personId: null
                };
                const invitation = Invitation.builder.build(flattened);
                expect(invitation.teamId.flatten).toBeEqual(flattened.teamId);
                expect(invitation.personId).toBeEqual(null);
            });

            it('should build invitation from flattened data with person ID', () => {
                const flattened = {
                    teamId: 'a1111111-1111-4111-1111-111111111111',
                    personId: 'b2222222-2222-4222-2222-222222222222'
                };
                const invitation = Invitation.builder.build(flattened);
                expect(invitation.teamId.flatten).toBeEqual(flattened.teamId);
                expect(invitation.personId?.flatten).toBeEqual(flattened.personId);
            });

            it('should build team-wide invitation', () => {
                const flattened = {
                    teamId: 'a1111111-1111-4111-1111-111111111111',
                    personId: null
                };
                const invitation = Invitation.builder.build(flattened);
                expect(invitation.personId).toBeEqual(null);
            });

            it('should build person-specific invitation', () => {
                const flattened = {
                    teamId: 'a1111111-1111-4111-1111-111111111111',
                    personId: 'b2222222-2222-4222-2222-222222222222'
                };
                const invitation = Invitation.builder.build(flattened);
                expect(invitation.personId).not.toBeEqual(null);
            });

            it('should round-trip through flatten and build with null person ID', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const original = new Invitation(teamId, null);
                const rebuilt = Invitation.builder.build(original.flatten);
                expect(rebuilt.teamId.flatten).toBeEqual(original.teamId.flatten);
                expect(rebuilt.personId).toBeEqual(null);
            });

            it('should round-trip through flatten and build with person ID', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const original = new Invitation(teamId, personId);
                const rebuilt = Invitation.builder.build(original.flatten);
                expect(rebuilt.teamId.flatten).toBeEqual(original.teamId.flatten);
                expect(rebuilt.personId?.flatten).toBeEqual(original.personId?.flatten);
            });

            it('should preserve invitation ID consistency after round-trip', () => {
                const teamId = Team.Id.builder.build('a1111111-1111-4111-1111-111111111111');
                const personId = Person.Id.builder.build('b2222222-2222-4222-2222-222222222222');
                const original = new Invitation(teamId, personId);
                const originalId = original.createId();
                const rebuilt = Invitation.builder.build(original.flatten);
                const rebuiltId = rebuilt.createId();
                expect(rebuiltId.flatten).toBeEqual(originalId.flatten);
            });

            it('should build with different team IDs', () => {
                const flattened1 = {
                    teamId: 'a1111111-1111-4111-1111-111111111111',
                    personId: null
                };
                const flattened2 = {
                    teamId: 'b2222222-2222-4222-2222-222222222222',
                    personId: null
                };
                const invitation1 = Invitation.builder.build(flattened1);
                const invitation2 = Invitation.builder.build(flattened2);
                expect(invitation1.teamId.flatten).not.toBeEqual(invitation2.teamId.flatten);
            });

            it('should build with different person IDs', () => {
                const flattened1 = {
                    teamId: 'a1111111-1111-4111-1111-111111111111',
                    personId: 'b2222222-2222-4222-2222-222222222222'
                };
                const flattened2 = {
                    teamId: 'a1111111-1111-4111-1111-111111111111',
                    personId: 'c3333333-3333-4333-3333-333333333333'
                };
                const invitation1 = Invitation.builder.build(flattened1);
                const invitation2 = Invitation.builder.build(flattened2);
                expect(invitation1.personId?.flatten).not.toBeEqual(invitation2.personId?.flatten);
            });
        });
    });
});
