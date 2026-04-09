/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from '@assertive-ts/core';
import { Dictionary, Flattable, UtcDate } from '@stevenkellner/typescript-common-functionality';
import type { FunctionsErrorCode } from '@stevenkellner/firebase-function';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { Person, PersonProperties, PersonSignInProperties, Team, TeamRole, User } from '@stevenkellner/team-conduct-api';
import { FirebaseConfiguration, Messaging } from '../../src/firebase';

export class Collection {

    private constructor(
        public readonly documents: Record<string, Document>,
        private readonly isDynamic: boolean = false
    ) {}

    public document(key: string): Document {
        const documentData = this.documents[key];
        if (!documentData) {
            if (this.isDynamic) {
                const doc = Document.dynamic();
                (this.documents as Record<string, Document>)[key] = doc;
                return doc;
            }
            throw new Error(`Unexpected document key: ${key}`);
        }
        return documentData;
    }

    public static docs(documents: Record<string, Document>): Collection {
        return new Collection(documents);
    }

    public static dynamic(): Collection {
        return new Collection({}, true);
    }
}

export class Document {
    private constructor(
        public readonly collections: Record<string, Collection>,
        public data: any,
        private readonly isDynamic: boolean = false
    ) {}

    public collection(key: string): Collection {
        const collectionData = this.collections[key];
        if (!collectionData) {
            if (this.isDynamic) {
                const coll = Collection.dynamic();
                (this.collections as Record<string, Collection>)[key] = coll;
                return coll;
            }
            throw new Error(`Unexpected collection key: ${key}`);
        }
        return collectionData;
    }

    public snapshot() {
        return {
            exists: this.data !== undefined,
            data: this.data
        };
    }

    public set(values: any) {
        this.data = Flattable.flatten(values);
    }

    public static colls(collections: Record<string, Collection>): Document {
        return new Document(collections, undefined);
    }

    public static data(data: any): Document {
        return new Document({}, data);
    }

    public static empty(): Document {
        return new Document({}, undefined);
    }

    public static dynamic(): Document {
        return new Document({}, undefined, true);
    }

    public static collsAndData(collections: Record<string, Collection>, data: any): Document {
        return new Document(collections, data);
    }

    public static user(id: User.Id, properties: User.Properties, settings: User.Settings, teams: Dictionary<Team.Id, User.TeamProperties>): Document {
        return Document.collsAndData(
            { notifications: Collection.dynamic() },
            User.builder.build({
                id: id.value,
                signInDate: UtcDate.now.flatten,
                signInType: { type: 'google' },
                properties: properties.flatten,
                settings: settings.flatten,
                teams: teams.flatten
            }).flatten
        );
    }

    public static personNotSignedIn(id: Person.Id): Document {
        return Document.data(Person.builder.build({
            id: id.guidString,
            properties: PersonProperties.builder.build({
                firstName: 'Test',
                lastName: 'User'
            }).flatten,
            fineIds: [],
            signInProperties: null
        }).flatten);
    }

    public static person(id: Person.Id, userId: User.Id, roles: TeamRole[]): Document {
        return Document.data(Person.builder.build({
            id: id.guidString,
            properties: PersonProperties.builder.build({
                firstName: 'Test',
                lastName: 'User'
            }).flatten,
            fineIds: [],
            signInProperties: PersonSignInProperties.builder.build({
                joinDate: UtcDate.now.flatten,
                userId: userId.value,
                roles: roles
            }).flatten
        }).flatten);
    }
}

export async function expectThrowsFunctionsError(fn: () => Promise<any>, expectedCode: FunctionsErrorCode, message: string | null = null): Promise<FunctionsError> {
    try {
        await fn();
        throw new Error('Expected function to throw a FunctionsError');
    } catch (error) {
        expect(error).toBeInstanceOf(FunctionsError);
        expect((error as FunctionsError).code).toBeEqual(expectedCode);
        if (message !== null)
            expect((error as FunctionsError).message).toBeEqual(message);
        return error as FunctionsError;
    }
}

let savedConfig: { firebaseFirestore: any; baseFirestoreDocument: any; messaging: any } | null = null;

export function configureFirebase(collections: Record<string, Collection>, messaging?: Messaging) {
    if (!savedConfig) {
        const config = FirebaseConfiguration.shared as any;
        savedConfig = {
            firebaseFirestore: config._firebaseFirestore,
            baseFirestoreDocument: config._baseFirestoreDocument,
            messaging: config._messaging
        };
    }
    FirebaseConfiguration.shared.reconfigure({
        firebaseFirestore: undefined as any,
        baseFirestoreDocument: Document.colls(collections) as any,
        messaging: messaging as any
    });
}

export function restoreFirebase() {
    if (savedConfig)
        FirebaseConfiguration.shared.reconfigure(savedConfig);
}
