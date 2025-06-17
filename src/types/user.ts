export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  loginUser: User | null;
  loginError: string;
  isLoading: boolean;
}
