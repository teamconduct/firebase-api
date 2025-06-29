import { FirestoreCollection, FirestoreDocument } from '@stevenkellner/firebase-function';
import { FirestoreScheme } from './FirestoreScheme';
import { Fine, FineTemplate, Invitation, Person, User, Team } from './types';
import { FirebaseConfiguration } from './firebase';

export class Firestore {

    protected base: FirestoreScheme;

    protected constructor() {
        this.base = FirebaseConfiguration.shared.baseFirestoreDocument;
    }

    private static sharedInstance: Firestore | null = null;

    public static get shared(): Firestore {
        if (!Firestore.sharedInstance)
            Firestore.sharedInstance = new Firestore();
        return Firestore.sharedInstance;
    }

    public team(id: Team.Id): FirestoreDocument<Team> {
        return this.base
            .collection('teams')
            .document(id.guidString) as FirestoreDocument<Team>;
    }

    public user(id: User.Id): FirestoreDocument<User> {
        return this.base
            .collection('users')
            .document(id.value);
    }

    public invitation(id: Invitation.Id): FirestoreDocument<Invitation> {
        return this.base
            .collection('invitations')
            .document(id.value);
    }

    public persons(teamId: Team.Id): FirestoreCollection<{ [x: string]: FirestoreDocument<Person, never>; }> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('persons');
    }

    public person(teamId: Team.Id, id: Person.Id): FirestoreDocument<Person> {
        return this.persons(teamId)
            .document(id.guidString);
    }

    public fineTemplates(teamId: Team.Id): FirestoreCollection<{ [x: string]: FirestoreDocument<FineTemplate, never>; }> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fineTemplates');
    }

    public fineTemplate(teamId: Team.Id, id: FineTemplate.Id): FirestoreDocument<FineTemplate> {
        return this.fineTemplates(teamId)
            .document(id.guidString);
    }

    public fines(teamId: Team.Id): FirestoreCollection<{ [x: string]: FirestoreDocument<Fine, never>; }> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fines');
    }

    public fine(teamId: Team.Id, id: Fine.Id): FirestoreDocument<Fine> {
        return this.fines(teamId)
            .document(id.guidString);
    }
}
