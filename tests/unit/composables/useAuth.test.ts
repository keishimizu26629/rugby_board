import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '@/composables/useAuth';
import type { AuthRepository } from '@/types/authRepository';
import type { User, AuthCredentials } from '@/types/user';

// Vue compositionのモック
vi.mock('vue', () => ({
  ref: vi.fn((initialValue) => ({ value: initialValue })),
  computed: vi.fn((getter) => ({ value: getter() })),
  inject: vi.fn(),
}));

describe('useAuth', () => {
  let mockAuthRepository: AuthRepository;

  beforeEach(async () => {
    vi.clearAllMocks();

    // モックリポジトリを作成
    mockAuthRepository = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      onAuthStateChanged: vi.fn(),
    };

    const { inject } = await import('vue');
    (inject as any).mockReturnValue(mockAuthRepository);
  });

  describe('login', () => {
    it('正常なログインが成功すること', async () => {
      const mockUser: User = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      };

      const credentials: AuthCredentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      (mockAuthRepository.login as any).mockResolvedValue(mockUser);

      const { login } = useAuth();
      const result = await login(credentials);

      expect(mockAuthRepository.login).toHaveBeenCalledWith(credentials);
      expect(result).toEqual(mockUser);
    });

    it('ログインエラーが適切に処理されること', async () => {
      const credentials: AuthCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      const error = new Error('Invalid credentials');
      (mockAuthRepository.login as any).mockRejectedValue(error);

      const { login } = useAuth();

      await expect(login(credentials)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('正常なログアウトが成功すること', async () => {
      (mockAuthRepository.logout as any).mockResolvedValue(undefined);

      const { logout } = useAuth();
      await logout();

      expect(mockAuthRepository.logout).toHaveBeenCalled();
    });
  });
});
