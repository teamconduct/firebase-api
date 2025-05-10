import { connectFunctionsEmulator, getFunctions, Functions as FunctionsInstance } from 'firebase/functions';
import { BytesCoder } from '@stevenkellner/typescript-common-functionality';
import { createClientFirebaseFunctions } from '@stevenkellner/firebase-function';
import { firebaseFunctionCreators } from '@stevenkellner/team-conduct-api';

export class FirebaseFunctions {

    private readonly functionsInstance: FunctionsInstance;

    public readonly functions: ReturnType<typeof createClientFirebaseFunctions<typeof firebaseFunctionCreators>>;

    public constructor() {
        this.functionsInstance = getFunctions(undefined, 'europe-west1');
        connectFunctionsEmulator(this.functionsInstance, '127.0.0.1', 5001);
        this.functions = createClientFirebaseFunctions(firebaseFunctionCreators, this.functionsInstance, `http://127.0.0.1:5001/${process.env.FUNCTESTS_PROJECT_ID}`, 'europe-west1', BytesCoder.fromHex(process.env.FUNCTESTS_MAC_KEY!));
    }
}
