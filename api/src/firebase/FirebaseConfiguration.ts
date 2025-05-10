import { FirestoreScheme } from '../FirestoreScheme';
import { Messaging } from './Messaging';

export class FirebaseConfiguration {

    public static readonly shared = new FirebaseConfiguration();

    private configured: boolean = false;

    private _baseFirestoreDocument: FirestoreScheme | null = null;

    private _messaging: Messaging | null = null;

    private constructor() {}

    public configure(configuration: {
        baseFirestoreDocument: FirestoreScheme,
        messaging: Messaging
    }) {
        if (this.configured)
            throw new Error('Configuration is already configured');
        this._baseFirestoreDocument = configuration.baseFirestoreDocument;
        this._messaging = configuration.messaging;
        this.configured = true;
    }

    public get baseFirestoreDocument(): FirestoreScheme {
        if (!this.configured || !this._baseFirestoreDocument)
            throw new Error('Configuration.baseFirestoreDocument is not configured');
        return this._baseFirestoreDocument;
    }

    public get messaging(): Messaging {
        if (!this.configured || !this._messaging)
            throw new Error('Configuration.messaging is not configured');
        return this._messaging;
    }
}

