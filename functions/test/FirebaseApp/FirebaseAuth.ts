import { connectAuthEmulator, getAuth, Auth as AuthInstance, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';
import { UserAuthId } from '@stevenkellner/firebase-function';

export class FirebaseAuth {

    private readonly authInstance: AuthInstance;

    public constructor() {
        this.authInstance = getAuth();
        connectAuthEmulator(this.authInstance, 'http://192.168.178.47:9099');
    }

    public async signIn(email: string | null = null, password: string | null = null): Promise<UserAuthId> {
        let userCredential: UserCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(this.authInstance, email ?? process.env.FUNCTESTS_USER_EMAIL!, password ?? process.env.FUNCTESTS_USER_PASSWORD!);
        } catch {
            userCredential = await signInWithEmailAndPassword(this.authInstance, email ?? process.env.FUNCTESTS_USER_EMAIL!, password ?? process.env.FUNCTESTS_USER_PASSWORD!);
        }
        return UserAuthId.builder.build(userCredential.user.uid);
    }

    public async signOut(): Promise<void> {
        await signOut(this.authInstance);
    }
}
