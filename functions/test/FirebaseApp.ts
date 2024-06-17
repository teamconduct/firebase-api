import { FirestoreScheme } from './../src/FirestoreScheme';
import { firebaseFunctions } from './../src/firebaseFunctions';
import * as dotenv from 'dotenv';
import { FirebaseApp as FirebaseAppBase } from 'firebase-function/lib/src/testSrc';
import { HexBytesCoder, Sha512, Utf8BytesCoder } from 'firebase-function';
import axios from 'axios';
import { UserRole } from '../src/types';
import { createTestTeam } from './createTestTeam';
import { testTeam } from './testTeams/testTeam_1';

dotenv.config({ path: 'test/.env.test' });

export class FirebaseApp extends FirebaseAppBase<typeof firebaseFunctions, FirestoreScheme> {

    private constructor() {
        const macKeyBytesCoder = new HexBytesCoder();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const macKey = macKeyBytesCoder.encode(process.env.FUNCTESTS_MAC_KEY!);
        super({
            macKey: macKey,
            firebaseOptions: {
                apiKey: process.env.FUNCTESTS_API_KEY,
                authDomain: process.env.FUNCTESTS_AUTH_DOMAIN,
                projectId: process.env.FUNCTESTS_PROJECT_ID,
                storageBucket: process.env.FUNCTESTS_STORAGE_BUCKET,
                messagingSenderId: process.env.FUNCTESTS_MESSAGING_SENDER_ID,
                appId: process.env.FUNCTESTS_APP_ID,
                measurementId: process.env.FUNCTESTS_MEASUREMENT_ID,
                clientEmail: process.env.FUNCTESTS_CLIENT_EMAIL,
                privateKey: process.env.FUNCTESTS_PRIVATE_KEY
            },
            region: 'europe-west1',
            emulatorPorts: {
                functions: 5001,
                auth: 9099,
                firestore: 8080
            }
        });
    }

    public static shared = new FirebaseApp();

    private hashUserId(userId: string): string {
        const userIdBytesCoder = new Utf8BytesCoder();
        const hasher = new Sha512();
        const hashedUserIdBytesCoder = new HexBytesCoder();
        const userIdBytes = userIdBytesCoder.encode(userId);
        const hashedUserIdBytes = hasher.hash(userIdBytes);
        return hashedUserIdBytesCoder.decode(hashedUserIdBytes);
    }

    public async addTestTeam(...roles: UserRole[]): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const userCredential = await this.auth.signIn(process.env.FUNCTESTS_USER_EMAIL!, process.env.FUNCTESTS_USER_PASSWORD!);
        const userId = this.hashUserId(userCredential.user.uid);
        await createTestTeam(testTeam, userId, roles);
        return userId;
    }

    public async clearFirestore(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        await axios.delete(`http://127.0.0.1:8080/emulator/v1/projects/${process.env.FUNCTESTS_PROJECT_ID!}/databases/(default)/documents`);
    }
}
