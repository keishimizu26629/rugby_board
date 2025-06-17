import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import type { AuthRepository } from '@/types/authRepository';
import type { User, AuthCredentials } from '@/types/user';

export class AuthService implements AuthRepository {
  private auth = getAuth();

  async login(credentials: AuthCredentials): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    );

    return this.mapFirebaseUser(userCredential.user);
  }

  async register(credentials: AuthCredentials): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      this.auth,
      credentials.email,
      credentials.password
    );

    return this.mapFirebaseUser(userCredential.user);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  async getCurrentUser(): Promise<User | null> {
    const user = this.auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, (user) => {
      callback(user ? this.mapFirebaseUser(user) : null);
    });
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || ''
    };
  }
}
