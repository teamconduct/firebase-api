import { FirestoreCollection } from '@stevenkellner/firebase-function';
import { FirebaseApp } from './FirebaseApp/FirebaseApp';
import { assert, expect } from '@assertive-ts/core'
import { deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, collection, Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Team, User } from '@stevenkellner/team-conduct-api';
import { Guid, Tagged, UtcDate } from '@stevenkellner/typescript-common-functionality';
import { RandomData } from './utils/RandomData';

describe('Firebase Rules', () => {

    let firestore: Firestore;

    before(async () => {
        firestore = getFirestore();
        connectFirestoreEmulator(firestore, '192.168.178.47', 8080);
    });

    afterEach(async () => {
        await FirebaseApp.shared.firestore.clear();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function expectPermissionDenied(fn: () => Promise<any>) {
        try {
            await fn();
            expect(false).toBeTrue();
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            assert(typeof error === 'object' && error !== null);
            assert('code' in (error as object));
            expect((error as { code: unknown }).code).toBeEqual('permission-denied');
        }
    }

    async function createTestDocuments() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const firestore = FirebaseApp.shared.firestore as { collection(key: string): FirestoreCollection<any> };
        await firestore.collection('userAuthIdDict').document('123').set({ data: 'test' });
        await firestore.collection('userAuthIdDict').document('123').collection('subCollection').document('456').set({ data: 'test' });
        await firestore.collection('users').document('123').set({ data: 'test' });
        await firestore.collection('users').document('123').collection('subCollection').document('456').set({ data: 'test' });
        await firestore.collection('teams').document('123').set({ data: 'test' });
        await firestore.collection('teams').document('123').collection('subCollection').document('456').set({ data: 'test' });
        await firestore.collection('other').document('123').set({ data: 'test' });
        await firestore.collection('other').document('123').collection('subCollection').document('456').set({ data: 'test' });
    }

    it('should not allow to create users, teams or anything other', async () => {
        await expectPermissionDenied(() => setDoc(doc(firestore, 'userAuthIdDict/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(firestore, 'userAuthIdDict/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(firestore, 'users/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(firestore, 'users/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(firestore, 'teams/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(firestore, 'teams/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(firestore, 'other/123'), { data: 'test' }));
        await expectPermissionDenied(() => setDoc(doc(firestore, 'other/123/subCollection/456'), { data: 'test' }));
    });

    it('should not allow to update users, teams or anything other', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'userAuthIdDict/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'userAuthIdDict/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'users/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'users/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'teams/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'teams/123/subCollection/456'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'other/123'), { data: 'test' }));
        await expectPermissionDenied(() => updateDoc(doc(firestore, 'other/123/subCollection/456'), { data: 'test' }));
    });

    it('should not allow to delete users, team or anything other', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'userAuthIdDict/123')));
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'userAuthIdDict/123/subCollection/456')));
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'users/123')));
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'users/123/subCollection/456')));
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'teams/123')));
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'teams/123/subCollection/456')));
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'other/123')));
        await expectPermissionDenied(() => deleteDoc(doc(firestore, 'other/123/subCollection/456')));
    });

    it('should not allow to get users or anything other then teams', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(firestore, 'userAuthIdDict/123')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'userAuthIdDict/123/subCollection/456')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'users/123')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'users/123/subCollection/456')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'other/123')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'other/123/subCollection/456')));
    });

    it('should not allow to list users or anything other then teams', async () => {
        await createTestDocuments();
        await expectPermissionDenied(() => getDocs(query(collection(firestore, 'userAuthIdDict'))));
        await expectPermissionDenied(() => getDocs(query(collection(firestore, 'userAuthIdDict/123/subCollection'))));
        await expectPermissionDenied(() => getDocs(query(collection(firestore, 'users'))));
        await expectPermissionDenied(() => getDocs(query(collection(firestore, 'users/123/subCollection'))));
        await expectPermissionDenied(() => getDocs(query(collection(firestore, 'other'))));
        await expectPermissionDenied(() => getDocs(query(collection(firestore, 'other/123/subCollection'))));
    });

    it('should not allow to get teams if not authenticated', async () => {
        await FirebaseApp.shared.auth.signOut();
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(firestore, 'teams/123')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'teams/123/subCollection/456')));
    });

    it('should not allow to get teams if auth does not exists', async () => {
        await FirebaseApp.shared.auth.signIn();
        await createTestDocuments();
        await expectPermissionDenied(() => getDoc(doc(firestore, 'teams/123')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'teams/123/subCollection/456')));
    });

    it('should allow to get teams if user is not in team', async () => {
        const userAuthId = await FirebaseApp.shared.auth.signIn();
        await createTestDocuments();
        const userId = RandomData.shared.userId();
        await FirebaseApp.shared.firestore.userAuth(userAuthId).set({ userId: userId });
        await FirebaseApp.shared.firestore.user(userId).set(new User(userId, UtcDate.now, new User.SignInTypeOAuth('google')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'teams/123')));
        await expectPermissionDenied(() => getDoc(doc(firestore, 'teams/123/subCollection/456')));
    });

    it('should allow to get teams if user is in team', async () => {
        const userAuthId = await FirebaseApp.shared.auth.signIn();
        await createTestDocuments();
        const userId = RandomData.shared.userId();
        await FirebaseApp.shared.firestore.userAuth(userAuthId).set({ userId: userId });
        const user = new User(userId, UtcDate.now, new User.SignInTypeOAuth('google'));
        const teamId: Team.Id = new Tagged('123' as unknown as Guid, 'team');
        user.teams.set(teamId, new User.TeamProperties(teamId, 'test', Tagged.generate('person')));
        await FirebaseApp.shared.firestore.user(userId).set(user);
        const snapshot1 = await getDoc(doc(firestore, 'teams/123'));
        expect(snapshot1.exists()).toBeTrue();
        expect(snapshot1.data()).toBeEqual({ data: 'test' });
        const snapshot2 = await getDoc(doc(firestore, 'teams/123/subCollection/456'));
        expect(snapshot2.exists()).toBeTrue();
        expect(snapshot2.data()).toBeEqual({ data: 'test' });
    });
});
