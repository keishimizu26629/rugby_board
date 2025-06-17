import { ref, computed, inject } from 'vue';
import type { AuthRepository } from '@/types/authRepository';
import type { User, AuthCredentials } from '@/types/user';
import { useAuthStore } from '@/stores/auth';

export function useAuth() {
  const authRepo = inject<AuthRepository>('authRepo')!;
  const authStore = useAuthStore();

  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string>('');

  const isLoggedIn = computed(() => !!currentUser.value);

  const login = async (credentials: AuthCredentials): Promise<User> => {
    isLoading.value = true;
    error.value = '';

    try {
      const user = await authRepo.login(credentials);
      currentUser.value = user;
      return user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '認証エラーが発生しました';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (credentials: AuthCredentials): Promise<User> => {
    isLoading.value = true;
    error.value = '';

    try {
      const user = await authRepo.register(credentials);
      currentUser.value = user;
      return user;
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登録エラーが発生しました';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authRepo.logout();
      currentUser.value = null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'ログアウトエラーが発生しました';
      throw err;
    }
  };

  const initAuthListener = (): (() => void) => {
    return authRepo.onAuthStateChanged((user) => {
      currentUser.value = user;
    });
  };

  const clearError = (): void => {
    error.value = '';
  };

  return {
    currentUser,
    isLoading,
    error,
    isLoggedIn,
    login,
    register,
    logout,
    initAuthListener,
    clearError
  };
}

/**
 * 認証機能コンポーザブル
 * AuthStoreのラッパーとして機能
 */
export const useAuthStoreWrapper = () => {
  const authStore = useAuthStore();

  const logout = async () => {
    try {
      await authStore.logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  return {
    currentUser: authStore.currentUser,
    isLoggedIn: authStore.isLoggedIn,
    logout,
  };
};
