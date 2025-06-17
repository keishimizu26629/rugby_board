import type { User, AuthCredentials } from './user';

export interface AuthRepository {
  login(_credentials: AuthCredentials): Promise<User>;
  register(_credentials: AuthCredentials): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChanged(_callback: (user: User | null) => void): () => void;
}
