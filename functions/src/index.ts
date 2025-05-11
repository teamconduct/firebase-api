import { configDotenv } from 'dotenv';
configDotenv({ path: 'src/.env' });

import * as admin from 'firebase-admin';
admin.initializeApp();

import { FirestoreDocument, provideFirebaseFunctions } from '@stevenkellner/firebase-function';
import { firebaseFunctionsContext, Configuration, FirebaseConfiguration } from '@stevenkellner/team-conduct-api';
import { BytesCoder } from '@stevenkellner/typescript-common-functionality';
import { getFirestore } from 'firebase-admin/firestore';

FirebaseConfiguration.shared.configure({
    baseFirestoreDocument: FirestoreDocument.base(getFirestore()),
    messaging: admin.messaging()
});

import * as i18n from 'i18n';
i18n.configure({
    locales: Configuration.Locale.all,
    defaultLocale: 'en',
    directory: 'src/locales',
    objectNotation: true
});

if (!process.env.MAC_KEY)
    throw new Error('MAC_KEY environment variable is required');
const macKey = BytesCoder.fromHex(process.env.MAC_KEY);

export = provideFirebaseFunctions(firebaseFunctionsContext, macKey, ['europe-west1'])
