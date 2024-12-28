/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { doc, collection, setDoc, updateDoc, deleteDoc, getDoc, getDocs, query } from 'firebase/firestore';
import { FirebaseApp } from './FirebaseApp';
import { expect } from 'firebase-function/lib/src/testSrc';
import { assert, expect as chai_expect } from 'chai';
import { Firestore } from '../src/Firestore';
import { FirestoreDocument, Tagged } from 'firebase-function';
import { User } from '../src/types';
import { TeamId } from '../src/types/Team';

describe('Firebase Rules', () => {

    afterEach(async () => {
        await FirebaseApp.shared.clearFirestore();
    });

    async function expectPermissionDenied(fn: () => Promise<any>) {
        try {
            await fn();
            chai_expect.fail('Expected permission-denied');
        } catch (error) {
            assert(typeof error === 'object' && error !== null);
            assert('code' in error);
            expect(error.code).to.be.equal('permission-denied');
        }
    }

    async function createTestDocuments() {
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('users').document('123').set({ data: 'test' });
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('users').document('123').collection('subCollection').document('456').set({ data: 'test' });
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('auth').document('123').set({ data: 'test' });
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('auth').document('123').collection('subCollection').document('456').set({ data: 'test' });
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('teams').document('123').set({ data: 'test' });
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('teams').document('123').collection('subCollection').document('456').set({ data: 'test' });
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('other').document('123').set({ data: 'test' });
        await (Firestore.shared.base as FirestoreDocument<any, any>).collection('other').document('123').collection('subCollection').document('456').set({ data: 'test' });
    }

    it('should not allow to create users, auth, teams or anything other', async () => {
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'users/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'users/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'auth/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'auth/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'teams/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'other/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(FirebaseApp.shared.firestore, 'other/123/subCollection/456'), { data: 'test' }));
    });

    it('should not allow to update users, auth, teams or anything other', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'users/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'users/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'auth/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'auth/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'teams/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'other/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(FirebaseApp.shared.firestore, 'other/123/subCollection/456'), { data: 'test' }));
    });

    it('should not allow to delete users, auth, team or anything other', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'users/123')));
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'users/123/subCollection/456')));
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'auth/123')));
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'auth/123/subCollection/456')));
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'teams/123')));
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456')));
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'other/123')));
        await expectPermissionDenied(() => deleteDoc(doc(FirebaseApp.shared.firestore, 'other/123/subCollection/456')));
    });

    it('should not allow to get users, auth or anything other then teams', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'users/123')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'users/123/subCollection/456')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'auth/123')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'auth/123/subCollection/456')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'other/123')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'other/123/subCollection/456')));
    });

    it('should not allow to list users, auth or anything other then teams', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => getDocs(query(collection(FirebaseApp.shared.firestore, 'users'))));
        await expectPermissionDenied(() => getDocs(query(collection(FirebaseApp.shared.firestore, 'users/123/subCollection'))));
        await expectPermissionDenied(() => getDocs(query(collection(FirebaseApp.shared.firestore, 'auth'))));
        await expectPermissionDenied(() => getDocs(query(collection(FirebaseApp.shared.firestore, 'auth/123/subCollection'))));
        await expectPermissionDenied(() => getDocs(query(collection(FirebaseApp.shared.firestore, 'other'))));
        await expectPermissionDenied(() => getDocs(query(collection(FirebaseApp.shared.firestore, 'other/123/subCollection'))));
    });

    it('should not allow to get teams if not authenticated', async () => {
        await FirebaseApp.shared.auth.signOut();
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456')));
    });

    it('should not allow to get teams if auth does not exists', async () => {
        await FirebaseApp.shared.signIn();
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456')));
    });

    it('should allow to get teams if user does not exists', async () => {
        const authUser = await FirebaseApp.shared.signIn();
        await Firestore.shared.auth(authUser.rawUid).set({ userId: authUser.id.value });
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456')));
    });

    it('should allow to get teams if user is not in team', async () => {
        const authUser = await FirebaseApp.shared.signIn();
        await Firestore.shared.auth(authUser.rawUid).set({ userId: authUser.id.value });
        await Firestore.shared.user(authUser.id).set(User.empty(authUser.id));
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123')));
        await expectPermissionDenied(() => getDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456')));
    });

    it('should allow to get teams if user is in team', async () => {
        const authUser = await FirebaseApp.shared.signIn();
        await Firestore.shared.auth(authUser.rawUid).set({ userId: authUser.id.value });
        const user = User.empty(authUser.id);
        user.teams.set('123' as unknown as TeamId, { name: 'test', personId: Tagged.generate('person') });
        await Firestore.shared.user(authUser.id).set(user);
        await createTestDocuments();
        const snapshot1 = await getDoc(doc(FirebaseApp.shared.firestore, 'teams/123'));
        expect(snapshot1.exists()).to.be.equal(true);
        expect(snapshot1.data()).to.be.deep.equal({ data: 'test' });
        const snapshot2 = await getDoc(doc(FirebaseApp.shared.firestore, 'teams/123/subCollection/456'));
        expect(snapshot2.exists()).to.be.equal(true);
        expect(snapshot2.data()).to.be.deep.equal({ data: 'test' });
    });
});
