import * as admin from 'firebase-admin';
admin.initializeApp();

import 'dotenv/config';
import * as i18n from 'i18n';
import { HexBytesCoder, provideFirebaseFunctions } from 'firebase-function';
import { firebaseFunctions } from './firebaseFunctions';

i18n.configure({
    locales: ['en', 'de'],
    defaultLocale: 'en',
    directory: 'src/locales',
    objectNotation: true
});
i18n.setLocale('de');

const macKeyBytesCoder = new HexBytesCoder();
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const macKey = macKeyBytesCoder.encode(process.env.MAC_KEY!);

export = provideFirebaseFunctions(firebaseFunctions, macKey, ['europe-west1'])
