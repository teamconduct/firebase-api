import { configDotenv } from 'dotenv';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { FirebaseAuth } from './FirebaseAuth';
import { FirebaseFirestore } from './FirebaseFirestore';
import { Configuration, User, UserRole, FirebaseConfiguration, PersonSignInProperties, Team, NotificationProperties, firebaseFunctionsContext } from '@stevenkellner/team-conduct-api';
import { getFirestore } from 'firebase-admin/firestore';
import { FirestoreDocument, createCallableClientFirebaseFunctions } from '@stevenkellner/firebase-function';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { BytesCoder, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { testTeam1 } from '../testTeams/testTeam1';
import { TestTeam } from '../testTeams/TestTeam';

export class FirebaseApp {

    public static shared = new FirebaseApp();

    public readonly auth: FirebaseAuth;

    public readonly firestore: FirebaseFirestore;

    public readonly functions: ReturnType<typeof createCallableClientFirebaseFunctions<typeof firebaseFunctionsContext>>;

    private _testTeam: TestTeam | null = null;

    private constructor() {
        this.initialize();
        this.auth = new FirebaseAuth();
        this.firestore = new FirebaseFirestore();
        const functionsInstance = getFunctions(undefined, 'europe-west1');
        connectFunctionsEmulator(functionsInstance, '192.168.178.47', 5001);
        this.functions = createCallableClientFirebaseFunctions(firebaseFunctionsContext, functionsInstance, `http://192.168.178.47:5001/${process.env.FUNCTESTS_PROJECT_ID}`, 'europe-west1', BytesCoder.fromHex(process.env.FUNCTESTS_MAC_KEY!));
    }

    private initialize() {
        configDotenv({ path: 'test/.env.test', override: true });
        process.env.FIRESTORE_EMULATOR_HOST = '192.168.178.47:8080';
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
        });
        FirebaseConfiguration.shared.configure({
            baseFirestoreDocument: FirestoreDocument.base(getFirestore()),
            messaging: admin.messaging()
        });
    }

    private* internal_createTestTeam(testTeam: TestTeam, userId: User.Id, roles: UserRole[]): Generator<Promise<unknown>> {
        const user = new User(userId);
        user.teams.set(testTeam.id, new User.TeamProperties(testTeam.id, testTeam.name, testTeam.persons[0].id));
        yield FirebaseApp.shared.firestore.user(userId).set(user);
        yield FirebaseApp.shared.firestore.team(testTeam.id).set(new Team(testTeam.id, testTeam.name, null));
        for (const [index, person] of testTeam.persons.entries()) {
            if (index === 0)
                person.signInProperties = new PersonSignInProperties(userId, UtcDate.now, new NotificationProperties(), roles);
            yield FirebaseApp.shared.firestore.person(testTeam.id, person.id).set(person);
        }
        for (const fineTemplate of testTeam.fineTemplates)
            yield FirebaseApp.shared.firestore.fineTemplate(testTeam.id, fineTemplate.id).set(fineTemplate);
        for (const fine of testTeam.fines)
            yield FirebaseApp.shared.firestore.fine(testTeam.id, fine.id).set(fine);
    }

    public async addTestTeam(roles: UserRole | UserRole[] = [], testTeam: TestTeam = testTeam1): Promise<User.Id> {
        const userId = await this.auth.signIn();
        await Promise.all([...this.internal_createTestTeam(testTeam, userId, typeof roles === 'string' ? [roles] : roles)]);
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
