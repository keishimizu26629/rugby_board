import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/authService';

// Firebase Auth のモック
vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    getAuth: vi.fn(() => ({ currentUser: null })),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn()
  };
});

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('Constructor', () => {
    it('should create instance with firebase auth', async () => {
      const { getAuth } = await import('firebase/auth');

      expect(getAuth).toHaveBeenCalled();
      expect(authService).toBeDefined();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com'
      };

      const { signInWithEmailAndPassword } = await import('firebase/auth');
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser
      } as any);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).toEqual({
        uid: mockUser.uid,
        email: mockUser.email
      });
    });

    it('should throw error for invalid credentials', async () => {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
        new Error('auth/invalid-credential')
      );

      await expect(authService.login({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should successfully register new user', async () => {
      const mockUser = {
        uid: 'new-uid',
        email: 'new@example.com'
      };

      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser
      } as any);

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123'
      });

      expect(result).toEqual({
        uid: mockUser.uid,
        email: mockUser.email
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const { signOut } = await import('firebase/auth');
      vi.mocked(signOut).mockResolvedValue();

      await expect(authService.logout()).resolves.not.toThrow();
    });
  });
});
