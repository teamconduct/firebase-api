import { configDotenv } from 'dotenv';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { FirebaseAuth } from './FirebaseAuth';
import { FirebaseFirestore } from './FirebaseFirestore';
import { Configuration, User, UserRole } from '../src/types';
import { testTeam1 } from './testTeams/testTeam1';
import { createTestTeam, TestTeam } from './createTestTeam';
import { FirebaseFunctions } from './FirebaseFunctions';

export class FirebaseApp {

    public readonly auth: FirebaseAuth;

    public readonly firestore: FirebaseFirestore;

    public readonly functions: FirebaseFunctions['functions'];

    private _testTeam: TestTeam | null = null;

    private constructor() {
        configDotenv({ path: 'test/.env.test' });
        initializeApp({
            apiKey: process.env.FUNCTESTS_API_KEY,
            authDomain: process.env.FUNCTESTS_AUTH_DOMAIN,
            databaseURL: process.env.FUNCTESTS_DATABASE_URL,
            projectId: process.env.FUNCTESTS_PROJECT_ID,
            storageBucket: process.env.FUNCTESTS_STORAGE_BUCKET,
            messagingSenderId: process.env.FUNCTESTS_MESSAGING_SENDER_ID,
            appId: process.env.FUNCTESTS_APP_ID,
            measurementId: process.env.FUNCTESTS_MEASUREMENT_ID
        });
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FUNCTESTS_PROJECT_ID,
                clientEmail: process.env.FUNCTESTS_CLIENT_EMAIL,
                privateKey: process.env.FUNCTESTS_PRIVATE_KEY
            }),
            databaseURL: process.env.FUNCTESTS_DATABASE_URL
        })
        this.auth = new FirebaseAuth();
        this.firestore = new FirebaseFirestore();
        this.functions = new FirebaseFunctions().functions;
    }

    public static shared = new FirebaseApp();

    public async addTestTeam(roles: UserRole | UserRole[] = [], testTeam: TestTeam = testTeam1): Promise<User.Id> {
        const userId = await this.auth.signIn();
        await createTestTeam(testTeam, userId, typeof roles === 'string' ? [roles] : roles);
        this._testTeam = testTeam;
        return userId;
    }

    public get testTeam(): TestTeam {
        if (this._testTeam === null)
            throw new Error('No test team created');
        return this._testTeam;
    }

    public get testConfiguration(): Configuration {
        return new Configuration('EUR', 'en');
    }
}
