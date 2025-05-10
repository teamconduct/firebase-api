import { configDotenv } from 'dotenv';
configDotenv({ path: 'src/.env' });

import * as admin from 'firebase-admin';
admin.initializeApp();

import { provideFirebaseFunctions } from '@stevenkellner/firebase-function';
import { firebaseFunctionCreators, Configuration, FirebaseConfiguration } from '@stevenkellner/team-conduct-api';
import { BytesCoder } from '@stevenkellner/typescript-common-functionality';

FirebaseConfiguration.shared.configure(

);

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

export = provideFirebaseFunctions(firebaseFunctionCreators, macKey, ['europe-west1'])
