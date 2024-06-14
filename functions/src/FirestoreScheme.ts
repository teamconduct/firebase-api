import { FirestoreCollection, FirestoreDocument, Flatten } from 'firebase-function';
import { Fine, FineTemplate, Person, User } from './types';

export type FirestoreScheme = FirestoreDocument<never, {
    users: FirestoreCollection<{
        [UserId in string]: FirestoreDocument<Flatten<User>>
    }>
    teams: FirestoreCollection<{
        [TeamId in string]: FirestoreDocument<{
            name: string,
            paypalMeLink: string | null
        }, {
            persons: FirestoreCollection<{
                [PersonId in string]: FirestoreDocument<Flatten<Person>>
            }>
            fineTemplates: FirestoreCollection<{
                [PersonId in string]: FirestoreDocument<Flatten<FineTemplate>>
            }>
            fines: FirestoreCollection<{
                [PersonId in string]: FirestoreDocument<Flatten<Fine>>
            }>
        }>
    }>
}>;
