import { FirebaseFunction, FunctionsError } from '@stevenkellner/firebase-function';
import { Invitation, Person, PersonPrivateProperties, Team } from '../../types';
import { Firestore } from '../../Firestore';
import { compactMap, Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class InvitationGetInvitationFunction extends FirebaseFunction<Invitation.Id, InvitationGetInvitationFunction.ReturnType> {

    public parametersBuilder = Invitation.Id.builder;

    public returnTypeBuilder = InvitationGetInvitationFunction.ReturnType.builder;

    public async execute(invitationId: Invitation.Id): Promise<InvitationGetInvitationFunction.ReturnType> {

        if (this.userId === null)
            throw new FunctionsError('unauthenticated', 'User not authenticated');

        const invitationSnapshot = await Firestore.shared.invitation(invitationId).snapshot();
        if (!invitationSnapshot.exists)
            throw new FunctionsError('not-found', 'Invitation not found');
        const invitation = Invitation.builder.build(invitationSnapshot.data);

        const teamSnapshot = await Firestore.shared.team(invitation.teamId).snapshot();
        if (!teamSnapshot.exists)
            throw new FunctionsError('not-found', 'Team not found');
        const team = Team.builder.build(teamSnapshot.data);

        if (invitation.personId !== null)
            return InvitationGetInvitationFunction.ReturnType.from(invitation.teamId, team.name, invitation.personId);

        const personSnapshots = await Firestore.shared.persons(invitation.teamId).documentSnapshots();
        const persons = compactMap(personSnapshots, personSnapshot => {
            if (!personSnapshot.exists)
                return null;
            const person = Person.builder.build(personSnapshot.data);
            if (person.signInProperties !== null)
                return null;
            return {
                id: person.id,
                properties: person.properties
            };
        });
        return InvitationGetInvitationFunction.ReturnType.from(invitation.teamId, team.name, persons);
    }
}

export namespace InvitationGetInvitationFunction {

    export type PersonIdOrPersons = {
        personId: Person.Id;
    } | {
        persons: {
            id: Person.Id,
            properties: PersonPrivateProperties,
        }[];
    };

    export namespace PersonIdOrPersons {

        export type Flatten = {
            personId: Person.Id.Flatten,
        } | {
            persons: {
                id: Person.Id.Flatten,
                properties: PersonPrivateProperties.Flatten,
            }[];
        };
    }

    export class ReturnType implements Flattable<ReturnType.Flatten> {

        private constructor(
            public teamId: Team.Id,
            public teamName: string,
            private personIdOrPersons: PersonIdOrPersons
        ) {}

        public static from(teamId: Team.Id, teamName: string, personId: Person.Id): ReturnType;
        public static from(teamId: Team.Id, teamName: string, persons: { id: Person.Id, properties: PersonPrivateProperties }[]): ReturnType;
        public static from(teamId: Team.Id, teamName: string, personIdOrPersons: Person.Id | { id: Person.Id, properties: PersonPrivateProperties }[]): ReturnType {
            if (Array.isArray(personIdOrPersons)) {
                return new ReturnType(teamId, teamName, {
                    persons: personIdOrPersons
                });
            }
            return new ReturnType(teamId, teamName, {
                personId: personIdOrPersons
            });
        }

        public get personId(): Person.Id | null {
            if (!('personId' in this.personIdOrPersons))
                return null;
            return this.personIdOrPersons.personId;
        }

        public get persons(): {
                id: Person.Id,
                properties: PersonPrivateProperties,
            }[] | null {
            if (!('persons' in this.personIdOrPersons))
                return null;
            return this.personIdOrPersons.persons;
        }

        public get flatten(): ReturnType.Flatten {
            if ('personId' in this.personIdOrPersons) {
                return {
                    teamId: this.teamId.flatten,
                    teamName: this.teamName,
                    personId: this.personIdOrPersons.personId.flatten
                };
            }
            return {
                teamId: this.teamId.flatten,
                teamName: this.teamName,
                persons: this.personIdOrPersons.persons.map(person => ({
                    id: person.id.flatten,
                    properties: person.properties.flatten
                }))
            }
        }
    }

    export namespace ReturnType {

        export type Flatten = {
            teamId: Team.Id.Flatten,
            teamName: string
        } & InvitationGetInvitationFunction.PersonIdOrPersons.Flatten;

        export class TypeBuilder implements ITypeBuilder<Flatten, ReturnType> {

            public build(value: Flatten): ReturnType {
                if ('personId' in value) {
                    return ReturnType.from(
                        Team.Id.builder.build(value.teamId),
                        value.teamName,
                        Person.Id.builder.build(value.personId)
                    );
                }
                return ReturnType.from(
                    Team.Id.builder.build(value.teamId),
                    value.teamName,
                    value.persons.map(person => ({
                        id: Person.Id.builder.build(person.id),
                        properties: PersonPrivateProperties.builder.build(person.properties)
                    }))
                );
            }
        }

        export const builder = new TypeBuilder();
    }
}
