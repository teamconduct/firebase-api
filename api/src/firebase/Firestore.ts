import { FirestoreBatch, FirestoreCollection, FirestoreDocument, UserAuthId } from '@stevenkellner/firebase-function';
import { FirestoreScheme } from './FirestoreScheme';
import { Fine, FineTemplate, Invitation, Person, User, Team } from '../types';
import { FirebaseConfiguration } from '.';

/**
 * Accessor class for Firestore documents and collections.
 *
 * Provides type-safe access to Firestore database documents and collections
 * following the schema defined in {@link FirestoreScheme}.
 *
 * Uses a singleton pattern to ensure consistent access to the Firestore instance.
 * All methods return strongly-typed Firestore references that can be used for
 * database operations.
 *
 * @example
 * ```typescript
 * // Access a team document
 * const teamDoc = Firestore.shared.team(teamId);
 *
 * // Access a person in a team
 * const personDoc = Firestore.shared.person(teamId, personId);
 *
 * // Access all fines in a team
 * const finesCollection = Firestore.shared.fines(teamId);
 * ```
 *
 * @remarks
 * Requires {@link FirebaseConfiguration} to be configured before use.
 * All document and collection references are lazy and don't perform any
 * database operations until explicitly called.
 */
export class Firestore {

    /**
     * Protected constructor to enforce singleton pattern.
     * Use {@link Firestore.shared} to get an instance.
     */
    protected constructor() {}

    /**
     * The singleton instance of the Firestore accessor.
     *
     * @private
     */
    private static sharedInstance: Firestore | null = null;

    /**
     * Gets the singleton instance of the Firestore accessor.
     *
     * Creates the instance on first access and returns the same instance
     * on subsequent calls.
     *
     * @returns The singleton Firestore accessor instance
     *
     * @example
     * ```typescript
     * const firestore = Firestore.shared;
     * const teamDoc = firestore.team(teamId);
     * ```
     */
    public static get shared(): Firestore {
        if (!Firestore.sharedInstance)
            Firestore.sharedInstance = new Firestore();
        return Firestore.sharedInstance;
    }

    /**
     * Gets the base Firestore schema from the configured Firebase instance.
     *
     * Accesses the global FirebaseConfiguration to retrieve the root document
     * reference for all database operations.
     *
     * @returns The base Firestore schema with typed collections
     *
     * @throws {Error} If FirebaseConfiguration has not been configured
     *
     * @private
     */
    protected get base(): FirestoreScheme {
        return FirebaseConfiguration.shared.baseFirestoreDocument;
    }

    public batch(): FirestoreBatch {
        return new FirestoreBatch(FirebaseConfiguration.shared.firebaseFirestore);
    }

    /**
     * Gets a reference to a team document.
     *
     * @param id - The unique identifier of the team
     * @returns A typed Firestore document reference for the team
     *
     * @example
     * ```typescript
     * const teamDoc = Firestore.shared.team(teamId);
     * const teamData = await teamDoc.get();
     * ```
     */
    public team(id: Team.Id): FirestoreDocument<Team> {
        return this.base
            .collection('teams')
            .document(id.guidString) as FirestoreDocument<Team>;
    }

    public userAuth(userAuthId: UserAuthId): FirestoreDocument<User.Id> {
        return this.base
            .collection('userAuthIdDict')
            .document(userAuthId.value);
    }

    /**
     * Gets a reference to a user document.
     *
     * @param id - The unique identifier of the user
     * @returns A typed Firestore document reference for the user
     *
     * @example
     * ```typescript
     * const userDoc = Firestore.shared.user(userId);
     * const userData = await userDoc.get();
     * ```
     */
    public user(id: User.Id): FirestoreDocument<User> {
        return this.base
            .collection('users')
            .document(id.value);
    }

    /**
     * Gets a reference to an invitation document.
     *
     * @param id - The unique identifier of the invitation
     * @returns A typed Firestore document reference for the invitation
     *
     * @example
     * ```typescript
     * const invitationDoc = Firestore.shared.invitation(invitationId);
     * const invitationData = await invitationDoc.get();
     * ```
     */
    public invitation(id: Invitation.Id): FirestoreDocument<Invitation> {
        return this.base
            .collection('invitations')
            .document(id.value);
    }

    /**
     * Gets a reference to the persons collection within a team.
     *
     * @param teamId - The unique identifier of the team
     * @returns A typed Firestore collection reference for persons in the team
     *
     * @example
     * ```typescript
     * const personsCollection = Firestore.shared.persons(teamId);
     * const allPersons = await personsCollection.getAll();
     * ```
     */
    public persons(teamId: Team.Id): FirestoreCollection<{ [x: string]: FirestoreDocument<Person, never>; }> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('persons');
    }

    /**
     * Gets a reference to a specific person document within a team.
     *
     * @param teamId - The unique identifier of the team
     * @param id - The unique identifier of the person
     * @returns A typed Firestore document reference for the person
     *
     * @example
     * ```typescript
     * const personDoc = Firestore.shared.person(teamId, personId);
     * const personData = await personDoc.get();
     * ```
     */
    public person(teamId: Team.Id, id: Person.Id): FirestoreDocument<Person> {
        return this.persons(teamId)
            .document(id.guidString);
    }

    /**
     * Gets a reference to the fine templates collection within a team.
     *
     * @param teamId - The unique identifier of the team
     * @returns A typed Firestore collection reference for fine templates in the team
     *
     * @example
     * ```typescript
     * const templatesCollection = Firestore.shared.fineTemplates(teamId);
     * const allTemplates = await templatesCollection.getAll();
     * ```
     */
    public fineTemplates(teamId: Team.Id): FirestoreCollection<{ [x: string]: FirestoreDocument<FineTemplate, never>; }> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fineTemplates');
    }

    /**
     * Gets a reference to a specific fine template document within a team.
     *
     * @param teamId - The unique identifier of the team
     * @param id - The unique identifier of the fine template
     * @returns A typed Firestore document reference for the fine template
     *
     * @example
     * ```typescript
     * const templateDoc = Firestore.shared.fineTemplate(teamId, templateId);
     * const templateData = await templateDoc.get();
     * ```
     */
    public fineTemplate(teamId: Team.Id, id: FineTemplate.Id): FirestoreDocument<FineTemplate> {
        return this.fineTemplates(teamId)
            .document(id.guidString);
    }

    /**
     * Gets a reference to the fines collection within a team.
     *
     * @param teamId - The unique identifier of the team
     * @returns A typed Firestore collection reference for fines in the team
     *
     * @example
     * ```typescript
     * const finesCollection = Firestore.shared.fines(teamId);
     * const allFines = await finesCollection.getAll();
     * ```
     */
    public fines(teamId: Team.Id): FirestoreCollection<{ [x: string]: FirestoreDocument<Fine, never>; }> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fines');
    }

    /**
     * Gets a reference to a specific fine document within a team.
     *
     * @param teamId - The unique identifier of the team
     * @param id - The unique identifier of the fine
     * @returns A typed Firestore document reference for the fine
     *
     * @example
     * ```typescript
     * const fineDoc = Firestore.shared.fine(teamId, fineId);
     * const fineData = await fineDoc.get();
     * ```
     */
    public fine(teamId: Team.Id, id: Fine.Id): FirestoreDocument<Fine> {
        return this.fines(teamId)
            .document(id.guidString);
    }
}
