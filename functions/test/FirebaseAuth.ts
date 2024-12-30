import { connectAuthEmulator, getAuth, Auth as AuthInstance, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';
import { User } from '../src/types';

export class FirebaseAuth {

    private readonly authInstance: AuthInstance;

    public constructor() {
        this.authInstance = getAuth();
        connectAuthEmulator(this.authInstance, `http://127.0.0.1:9099`);
    }

    public async signIn(email: string | null = null, password: string | null = null): Promise<User.Id> {
        let userCredential: UserCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(this.authInstance, email ?? process.env.FUNCTESTS_USER_EMAIL!, password ?? process.env.FUNCTESTS_USER_PASSWORD!);
        } catch {
            userCredential = await signInWithEmailAndPassword(this.authInstance, email ?? process.env.FUNCTESTS_USER_EMAIL!, password ?? process.env.FUNCTESTS_USER_PASSWORD!);
        }
        return User.Id.builder.build(userCredential.user.uid);
    }

    public async signOut(): Promise<void> {
        await signOut(this.authInstance);
    }
}
