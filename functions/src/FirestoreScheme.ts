import { FirestoreCollection, FirestoreDocument } from 'firebase-function';
import { Fine, FineTemplate, Person, User } from './types';
import { Invitation } from './types/Invitation';
import { Team } from './types/Team';

export type FirestoreScheme = FirestoreDocument<never, {
    auth: FirestoreCollection<{
        [RawUid in string]: FirestoreDocument<{
            userId: string
        }>
    }>
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
