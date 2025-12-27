/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from '@assertive-ts/core';
import { User, Team, Person, NotificationProperties, PersonPrivateProperties, PersonSignInProperties, UserRole } from '../../src/types/index';
import { Dictionary, Flattable, UtcDate } from '@stevenkellner/typescript-common-functionality';
import type { FunctionsErrorCode } from '@stevenkellner/firebase-function';
import { FunctionsError } from '@stevenkellner/firebase-function';
import { FirebaseConfiguration, Messaging } from '../../src';

export class Collection {

    private constructor(
        public readonly documents: Record<string, Document>
    ) {}

    public document(key: string): Document {
        const documentData = this.documents[key];
        if (!documentData)
            throw new Error(`Unexpected document key: ${key}`);
        return documentData;
    }

    public static docs(documents: Record<string, Document>): Collection {
        return new Collection(documents);
    }
}

export class Document {
    private constructor(
        public readonly collections: Record<string, Collection>,
        public data: any
    ) {}

    public collection(key: string): Collection {
        const collectionData = this.collections[key];
        if (!collectionData)
            throw new Error(`Unexpected collection key: ${key}`);
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

    public static collsAndData(collections: Record<string, Collection>, data: any): Document {
        return new Document(collections, data);
    }

    public static user(id: User.Id, teams: Dictionary<Team.Id, User.TeamProperties>): Document {
        return Document.data(User.builder.build({
            id: id.value,
            teams: teams.flatten
        }).flatten);
    }

    public static personNotSignedIn(id: Person.Id): Document {
        return Document.data(Person.builder.build({
            id: id.guidString,
            properties: PersonPrivateProperties.builder.build({
                firstName: 'Test',
                lastName: 'User'
            }).flatten,
            fineIds: [],
            signInProperties: null
        }).flatten);
    }

    public static person(id: Person.Id, userId: User.Id, roles: UserRole[]): Document {
        return Document.data(Person.builder.build({
            id: id.guidString,
            properties: PersonPrivateProperties.builder.build({
                firstName: 'Test',
                lastName: 'User'
            }).flatten,
            fineIds: [],
            signInProperties: PersonSignInProperties.builder.build({
                signInDate: UtcDate.now.flatten,
                userId: userId.value,
                notificationProperties: new NotificationProperties().flatten,
                roles: roles
            }).flatten
        }).flatten);
    }

    public static personWithSubscriptions(id: Person.Id, subscriptions: NotificationProperties.Subscription[], tokens?: Dictionary<NotificationProperties.TokenId, string>): Document {
        return Document.data(Person.builder.build({
            id: id.guidString,
            properties: PersonPrivateProperties.builder.build({
                firstName: 'Test',
                lastName: 'User'
            }).flatten,
            fineIds: [],
            signInProperties: PersonSignInProperties.builder.build({
                signInDate: UtcDate.now.flatten,
                userId: 'user-123',
                notificationProperties: new NotificationProperties(tokens, subscriptions).flatten,
                roles: []
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

export function configureFirebase(collections: Record<string, Collection>, messaging?: Messaging) {
    FirebaseConfiguration.shared.reconfigure({
        baseFirestoreDocument: Document.colls(collections) as any,
        messaging: messaging as any
    });
}
