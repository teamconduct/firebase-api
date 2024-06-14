import { FirestoreCollection, FirestoreDocument } from 'firebase-function';
import { Fine, FineTemplate, Person, User } from './types';

export type FirestoreScheme = FirestoreDocument<never, {
    users: FirestoreCollection<{
        [UserId in string]: FirestoreDocument<User>
    }>
    teams: FirestoreCollection<{
        [TeamId in string]: FirestoreDocument<{
            name: string,
            paypalMeLink: string | null
        }, {
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
