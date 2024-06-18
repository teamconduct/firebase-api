import { FirestoreDocument, FirestorePath } from 'firebase-function';
import * as admin from 'firebase-admin';
import { FirestoreScheme } from './FirestoreScheme';
import { Fine, FineId, FineTemplate, FineTemplateId, Person, PersonId, User, UserId } from './types';
import { Invitation, InvitationId } from './types/Invitation';
import { Team, TeamId } from './types/Team';

export class Firestore {

    public base: FirestoreScheme = new FirestoreDocument(admin.app().firestore(), new FirestorePath());

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor() {}

    public static shared = new Firestore();

    public team(id: TeamId): FirestoreDocument<Team> {
        return this.base
            .collection('teams')
            .document(id.guidString) as FirestoreDocument<Team>;
    }

    public user(id: UserId): FirestoreDocument<User> {
        return this.base
            .collection('users')
            .document(id.value);
    }

    public invitation(id: InvitationId): FirestoreDocument<Invitation> {
        return this.base
            .collection('invitations')
            .document(id.value);
    }

    public person(teamId: TeamId, id: PersonId): FirestoreDocument<Person> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('persons')
            .document(id.guidString);
    }

    public fineTemplate(teamId: TeamId, id: FineTemplateId): FirestoreDocument<FineTemplate> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fineTemplates')
            .document(id.guidString);
    }

    public fine(teamId: TeamId, id: FineId): FirestoreDocument<Fine> {
        return this.base
            .collection('teams')
            .document(teamId.guidString)
            .collection('fines')
            .document(id.guidString);
    }
}
