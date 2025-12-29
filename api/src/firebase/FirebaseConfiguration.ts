import { FirestoreScheme } from './FirestoreScheme';
import { Messaging } from './Messaging';
import { Firestore as FirebaseFirestore } from 'firebase-admin/firestore';

/**
 * Singleton configuration manager for Firebase services.
 *
 * Provides centralized access to Firestore document reference and Firebase Cloud Messaging.
 * Must be configured once before accessing services.
 */
export class FirebaseConfiguration {

    /**
     * Singleton instance of FirebaseConfiguration.
     */
    public static readonly shared = new FirebaseConfiguration();

    private configured: boolean = false;

    private _firebaseFirestore: FirebaseFirestore | null = null;

    private _baseFirestoreDocument: FirestoreScheme | null = null;

    private _messaging: Messaging | null = null;

    /**
     * Private constructor to enforce singleton pattern.
     */
    private constructor() {}

    /**
     * Configures the Firebase services.
     *
     * Must be called exactly once before accessing any Firebase services.
     * Subsequent calls will throw an error.
     *
     * @param configuration - Configuration object containing Firestore and Messaging services
     * @throws Error if already configured
     */
    public configure(configuration: {
        firebaseFirestore: FirebaseFirestore,
        baseFirestoreDocument: FirestoreScheme,
        messaging: Messaging
    }) {
        if (this.configured)
            throw new Error('Configuration is already configured');
        this._firebaseFirestore = configuration.firebaseFirestore;
        this._baseFirestoreDocument = configuration.baseFirestoreDocument;
        this._messaging = configuration.messaging;
        this.configured = true;
    }

    /**
     * Reconfigures the Firebase services.
     *
     * Allows updating the configuration with new services.
     *
     * @param configuration - New configuration object containing Firestore and Messaging services
     */
    public reconfigure(configuration: {
        firebaseFirestore: FirebaseFirestore,
        baseFirestoreDocument: FirestoreScheme,
        messaging: Messaging
    }) {
        this.configured = false;
        this.configure(configuration);
    }

    public get firebaseFirestore(): FirebaseFirestore {
        if (!this.configured || !this._firebaseFirestore)
            throw new Error('Configuration.firebaseFirestore is not configured');
        return this._firebaseFirestore;
    }

    /**
     * Gets the base Firestore document reference.
     *
     * @returns The configured Firestore document scheme
     * @throws Error if not yet configured
     */
    public get baseFirestoreDocument(): FirestoreScheme {
        if (!this.configured || !this._baseFirestoreDocument)
            throw new Error('Configuration.baseFirestoreDocument is not configured');
        return this._baseFirestoreDocument;
    }

    /**
     * Gets the Firebase Cloud Messaging service.
     *
     * @returns The configured Messaging service
     * @throws Error if not yet configured
     */
    public get messaging(): Messaging {
        if (!this.configured || !this._messaging)
            throw new Error('Configuration.messaging is not configured');
        return this._messaging;
    }
}

