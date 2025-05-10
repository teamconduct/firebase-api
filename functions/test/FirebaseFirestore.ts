import { FirestoreDocument } from '@stevenkellner/firebase-function';
import { FirestoreScheme } from '@stevenkellner/team-conduct-api';
import { Firestore } from '@stevenkellner/team-conduct-api/src/Firestore';
import axios from 'axios';

export class FirebaseFirestore extends Firestore {

    public constructor() {
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
        super();
    }

    public collection<Key extends keyof FirestoreDocument.SubCollectionsOf<FirestoreScheme> & string>(key: Key): FirestoreDocument.SubCollectionsOf<FirestoreScheme>[Key] {
        return this.base.collection(key);
    }

    public async clear(): Promise<void> {
        await axios.delete(`http://127.0.0.1:8080/emulator/v1/projects/${process.env.FUNCTESTS_PROJECT_ID!}/databases/(default)/documents`);
    }
}
