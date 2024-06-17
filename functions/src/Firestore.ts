import { FirestoreDocument, FirestorePath, Guid } from 'firebase-function';
import * as admin from 'firebase-admin';
import { FirestoreScheme } from './FirestoreScheme';
import { Fine, FineTemplate, Person, User } from './types';
import { Invitation } from './types/Invitation';
import { Team } from './types/Team';

export class Firestore {

    public base: FirestoreScheme = new FirestoreDocument(admin.app().firestore(), new FirestorePath());

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static shared = new Firestore();

    public team(id: Guid): FirestoreDocument<Team> {
        return this.base
            .collection('teams')
            .document(id.guidString) as FirestoreDocument<Team>;
    }

    public user(id: string): FirestoreDocument<User> {
        return this.base
            .collection('users')
            .document(id);
    }

    public invitation(id: string): FirestoreDocument<Invitation> {
        return this.base
            .collection('invitations')
            .document(id);
    }

    public person(teamId: Guid, id: Guid): FirestoreDocument<Person> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('persons')
            .document(id.guidString);
    }

    public fineTemplate(teamId: Guid, id: Guid): FirestoreDocument<FineTemplate> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fineTemplates')
            .document(id.guidString);
    }

    public fine(teamId: Guid, id: Guid): FirestoreDocument<Fine> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fines')
            .document(id.guidString);
    }
}
