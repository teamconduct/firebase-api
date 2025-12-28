import { configDotenv } from 'dotenv';
configDotenv({ path: 'src/.env' });

import * as admin from 'firebase-admin';
admin.initializeApp();

import { FirestoreDocument, provideFirebaseFunctions } from '@stevenkellner/firebase-function';
import { FirebaseConfiguration } from '@stevenkellner/team-conduct-api';
import { BytesCoder } from '@stevenkellner/typescript-common-functionality';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { firebaseFunctionsExecutableContext } from './functions/firebaseFunctionsExecutableContext';

FirebaseConfiguration.shared.configure({
    baseFirestoreDocument: FirestoreDocument.base(getFirestore()),
    messaging: admin.messaging()
});

if (!process.env.MAC_KEY)
    throw new Error('MAC_KEY environment variable is required');
const macKey = BytesCoder.fromHex(process.env.MAC_KEY);

export = provideFirebaseFunctions(firebaseFunctionsExecutableContext, macKey, {
    onCall: onCall,
    onRequest: onRequest,
    onSchedule: onSchedule
}, ['europe-west1'])
