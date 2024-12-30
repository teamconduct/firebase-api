import { configDotenv } from 'dotenv';
import * as admin from 'firebase-admin';
import { initializeApp } from 'firebase/app';
import { FirebaseAuth } from './FirebaseAuth';
import { FirebaseFirestore } from './FirebaseFirestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { createFirebaseFunctions } from '@stevenkellner/firebase-function/client';
import { BytesCoder } from '@stevenkellner/typescript-common-functionality';
import * as ClientFunctions from './FirebaseFunctions';
import { Configuration, User, UserRole } from '../src/types';
import { testTeam1 } from './testTeams/testTeam1';
import { createTestTeam, TestTeam } from './createTestTeam';

export class FirebaseApp {

    public readonly auth: FirebaseAuth;

    public readonly firestore: FirebaseFirestore;

    public readonly functions: ClientFunctions.ClientFunctions;

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
        const functionsInstance = getFunctions(undefined, 'europe-west1');
        connectFunctionsEmulator(functionsInstance, '127.0.0.1', 5001);
        this.functions = createFirebaseFunctions(`http://127.0.0.1:5001/${process.env.FUNCTESTS_PROJECT_ID}`, 'europe-west1', BytesCoder.fromHex(process.env.FUNCTESTS_MAC_KEY!), builder => ({
            team: {
                new: builder.function(ClientFunctions.TeamNewClientFunction)
            },
                user: {
                    login: builder.function(ClientFunctions.UserLoginClientFunction),
                    roleEdit: builder.function(ClientFunctions.UserRoleEditClientFunction)
                },
                paypalMe: {
                    edit: builder.function(ClientFunctions.PaypalMeEditClientFunction)
                },
                notification: {
                    register: builder.function(ClientFunctions.NotificationRegisterClientFunction),
                    subscribe: builder.function(ClientFunctions.NotificationSubscribeClientFunction)
                },
                invitation: {
                    invite: builder.function(ClientFunctions.InvitationInviteClientFunction),
                    withdraw: builder.function(ClientFunctions.InvitationWithdrawClientFunction),
                    register: builder.function(ClientFunctions.InvitationRegisterClientFunction)
                },
                person: {
                    add: builder.function(ClientFunctions.PersonAddClientFunction),
                    update: builder.function(ClientFunctions.PersonUpdateClientFunction),
                    delete: builder.function(ClientFunctions.PersonDeleteClientFunction)
                },
                fineTemplate: {
                    add: builder.function(ClientFunctions.FineTemplateAddClientFunction),
                    update: builder.function(ClientFunctions.FineTemplateUpdateClientFunction),
                    delete: builder.function(ClientFunctions.FineTemplateDeleteClientFunction)
                },
                fine: {
                    add: builder.function(ClientFunctions.FineAddClientFunction),
                    update: builder.function(ClientFunctions.FineUpdateClientFunction),
                    delete: builder.function(ClientFunctions.FineDeleteClientFunction)
                }
        }));
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
