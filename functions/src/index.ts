import * as admin from 'firebase-admin';
admin.initializeApp();

import 'dotenv/config';
import { HexBytesCoder, provideFirebaseFunctions } from 'firebase-function';
import { firebaseFunctions } from './firebaseFunctions';

const macKeyBytesCoder = new HexBytesCoder();
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const macKey = macKeyBytesCoder.encode(process.env.MAC_KEY!);

export = provideFirebaseFunctions(firebaseFunctions, macKey, ['europe-west1'])
