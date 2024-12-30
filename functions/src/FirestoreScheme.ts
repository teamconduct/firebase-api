import { FirestoreCollection, FirestoreDocument } from '@stevenkellner/firebase-function/admin';
import { Fine, FineTemplate, Invitation, Person, Team, User } from './types';

export type FirestoreScheme = FirestoreDocument<never, {
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
