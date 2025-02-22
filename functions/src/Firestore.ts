import { FirestoreDocument } from '@stevenkellner/firebase-function';
import { FirestoreScheme } from './FirestoreScheme';
import { Fine, FineTemplate, Invitation, Person, User, Team } from './types';
import { getFirestore } from 'firebase-admin/firestore';

export class Firestore {

    protected base: FirestoreScheme;

    protected constructor() {
        this.base = FirestoreDocument.base(getFirestore());
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

    public person(teamId: Team.Id, id: Person.Id): FirestoreDocument<Person> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('persons')
            .document(id.guidString);
    }

    public fineTemplate(teamId: Team.Id, id: FineTemplate.Id): FirestoreDocument<FineTemplate> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fineTemplates')
            .document(id.guidString);
    }

    public fine(teamId: Team.Id, id: Fine.Id): FirestoreDocument<Fine> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fines')
            .document(id.guidString);
    }
}
