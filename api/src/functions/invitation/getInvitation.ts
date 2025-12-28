import { FirebaseFunction } from '@stevenkellner/firebase-function';
import { Invitation, Person, PersonPrivateProperties, Team } from '../../types';
import {  Flattable, ITypeBuilder } from '@stevenkellner/typescript-common-functionality';

export class InvitationGetInvitationFunction implements FirebaseFunction<Invitation.Id, InvitationGetInvitationFunction.ReturnType> {

    public parametersBuilder = Invitation.Id.builder;

    public returnTypeBuilder = InvitationGetInvitationFunction.ReturnType.builder;
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
        } & PersonIdOrPersons.Flatten;

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
