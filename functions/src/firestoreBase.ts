import * as admin from 'firebase-admin';
import { FirestoreDocument, FirestorePath } from 'firebase-function';
import { FirestoreScheme } from './FirestoreScheme';

export const firestoreBase: FirestoreScheme = new FirestoreDocument(admin.app().firestore(), new FirestorePath());
