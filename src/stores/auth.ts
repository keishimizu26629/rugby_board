import { defineStore } from 'pinia';
import { ref, inject } from 'vue';
import type { User, AuthCredentials } from '@/types/user';
import type { AuthRepository } from '@/types/authRepository';
import router from '@/router';
import { getFirestore, doc, runTransaction, getDoc } from 'firebase/firestore';

export const useAuthStore = defineStore('auth', () => {
  const authRepo = inject<AuthRepository>('authRepo')!;

  const currentUser = ref<User | null>(null);
  const isLoggedIn = ref(false);
  const loginError = ref('');
  const isLoading = ref(false);
  const positions = ref<any[]>([]);

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

  const updatePositions = (newPositions: any) => {
    positions.value = [];
    Object.entries(newPositions).forEach(([key, value]: [string, any]) => {
      const position = {
        name: value.name,
        position: value.position
      };
      positions.value.push(position);
    });
  };

  const changePositions = (newPositions: any) => {
    positions.value = Object.values(newPositions);
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

  const testPost = async ({ name, players }: { name: string; players: any }) => {
    if (!currentUser.value) {
      throw new Error('User not logged in');
    }

    try {
      const db = getFirestore();
      const loginUserRef = doc(db, 'users', currentUser.value.uid);

      await runTransaction(db, async (transaction) => {
        const loginUser = await transaction.get(loginUserRef);
        const userData = loginUser.data();

        if (userData) {
          const positions = userData.positions || {};
          const newPosition = {
            name: name,
            position: players
          };
          positions[name] = newPosition;
          userData.positions = positions;

          await transaction.set(loginUserRef, userData);
          changePositions(positions);
        }
      });
    } catch (error) {
      console.error('Error in testPost:', error);
      throw error;
    }
  };

  const testDelete = async (name: string) => {
    if (!currentUser.value) {
      throw new Error('User not logged in');
    }

    try {
      const db = getFirestore();
      const loginUserRef = doc(db, 'users', currentUser.value.uid);

      await runTransaction(db, async (transaction) => {
        const loginUser = await transaction.get(loginUserRef);
        const userData = loginUser.data();

        if (userData) {
          const positions = userData.positions || {};
          delete positions[name];
          userData.positions = positions;

          await transaction.set(loginUserRef, userData);
          changePositions(positions);
        }
      });
    } catch (error) {
      console.error('Error in testDelete:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    if (!currentUser.value) {
      return;
    }

    try {
      const db = getFirestore();
      const docRef = doc(db, 'users', currentUser.value.uid);
      const response = await getDoc(docRef);

      if (response.exists()) {
        const userData = response.data();
        if (userData.positions) {
          updatePositions(userData.positions);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return {
    currentUser,
    loginUser: currentUser, // 後方互換性のためのalias
    isLoggedIn,
    loginError,
    isLoading,
    positions,
    setUser,
    setError,
    clearError,
    setLoading,
    updatePositions,
    changePositions,
    login,
    loginUserAccount,
    register,
    logout,
    initAuthListener,
    testPost,
    testDelete,
    fetchData
  };
});
