import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import type { User, AuthCredentials } from '@/types/user';
import type { AuthRepository } from '@/types/authRepository';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const authRepo = inject<AuthRepository>('authRepo')!;

  const currentUser = ref<User | null>(null);
  const isLoggedIn = ref(false);
  const loginError = ref('');
  const isLoading = ref(false);

  const setUser = (user: User | null) => {
    currentUser.value = user;
    isLoggedIn.value = !!user;
  };

  const setError = (error: string) => {
    loginError.value = error;
  };

  const clearError = () => {
    loginError.value = '';
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const login = async (credentials: AuthCredentials) => {
    setLoading(true);
    clearError();

    try {
      const user = await authRepo.login(credentials);
      setUser(user);
      router.push('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUserAccount = async (credentials: AuthCredentials) => {
    return await login(credentials);
  };

  const register = async (credentials: AuthCredentials) => {
    setLoading(true);
    clearError();

    try {
      const user = await authRepo.register(credentials);
      setUser(user);
      router.push('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登録に失敗しました';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authRepo.logout();
      currentUser.value = null;
      isLoggedIn.value = false;
      clearError();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const initAuthListener = () => {
    return authRepo.onAuthStateChanged((user) => {
      setUser(user);
    });
  };

  return {
    currentUser,
    loginUser: currentUser, // 後方互換性のためのalias
    isLoggedIn,
    loginError,
    isLoading,
    setUser,
    setError,
    clearError,
    setLoading,
    login,
    loginUserAccount,
    register,
    logout,
    initAuthListener
  };
});
