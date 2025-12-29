import { FirestoreCollection, FirestoreDocument } from '@stevenkellner/firebase-function';
import { Fine, FineTemplate, Invitation, Person, Team, User } from '../types';

/**
 * Type definition for the Firestore database schema.
 *
 * Defines the hierarchical structure of the Firestore database:
 * - **users**: Collection of user documents indexed by User.Id
 * - **invitations**: Collection of invitation documents indexed by Invitation.Id
 * - **teams**: Collection of team documents indexed by Team.Id, each containing:
 *   - **persons**: Subcollection of person documents indexed by Person.Id
 *   - **fineTemplates**: Subcollection of fine template documents indexed by FineTemplate.Id
 *   - **fines**: Subcollection of fine documents indexed by Fine.Id
 *
 * This type ensures type-safe access to Firestore collections and documents
 * throughout the application.
 */
export type FirestoreScheme = FirestoreDocument<never, {
    userAuthIds: FirestoreCollection<{
        [UserAuthId in string]: FirestoreDocument<User.Id>
    }>,
    users: FirestoreCollection<{
        [UserId in string]: FirestoreDocument<User>
    }>
    invitations: FirestoreCollection<{
        [InvitationId in string]: FirestoreDocument<Invitation>
    }>
    teams: FirestoreCollection<{
        [TeamId in string]: FirestoreDocument<Team, {
            persons: FirestoreCollection<{
                [PersonId in string]: FirestoreDocument<Person>
            }>
            fineTemplates: FirestoreCollection<{
                [PersonId in string]: FirestoreDocument<FineTemplate>
            }>
            fines: FirestoreCollection<{
                [PersonId in string]: FirestoreDocument<Fine>
            }>
        }>
    }>
}>;
