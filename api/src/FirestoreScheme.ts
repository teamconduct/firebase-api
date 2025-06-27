import { FirestoreCollection, FirestoreDocument } from '@stevenkellner/firebase-function';
import { Fine, FineTemplate, UserInvitation, Person, Team, User } from './types';

export type FirestoreScheme = FirestoreDocument<never, {
    users: FirestoreCollection<{
        [UserId in string]: FirestoreDocument<User>
    }>
    userInvitations: FirestoreCollection<{
        [UserInvitationId in string]: FirestoreDocument<UserInvitation>
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
