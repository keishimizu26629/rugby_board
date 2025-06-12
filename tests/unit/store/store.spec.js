import Vuex from 'vuex';
import { createLocalVue } from '@vue/test-utils';
import store from '@/store';

const localVue = createLocalVue();
localVue.use(Vuex);

// Firebase のモック
const mockFirebase = {
  auth: () => ({
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
  }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn(),
      }),
    }),
    runTransaction: jest.fn(),
  }),
};

jest.mock('firebase', () => mockFirebase);

describe('Vuex Store', () => {
  let testStore;

  beforeEach(() => {
    // ストアの初期化
    testStore = new Vuex.Store({
      state: {
        loginUser: null,
        positions: []
      },
      getters: store.getters,
      mutations: store.mutations,
      actions: store.actions
    });
  });

  describe('getters', () => {
    test('loginUser getter should return the login user', () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      testStore.state.loginUser = mockUser;

      expect(testStore.getters.loginUser).toEqual(mockUser);
    });

    test('positions getter should return the positions array', () => {
      const mockPositions = [
        { name: 'formation1', position: [] },
        { name: 'formation2', position: [] }
      ];
      testStore.state.positions = mockPositions;

      expect(testStore.getters.positions).toEqual(mockPositions);
    });

    test('loginUser getter should return null when no user is logged in', () => {
      expect(testStore.getters.loginUser).toBeNull();
    });

    test('positions getter should return empty array when no positions exist', () => {
      expect(testStore.getters.positions).toEqual([]);
    });
  });

  describe('mutations', () => {
    test('updateLoginUser should update the login user state', () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };

      testStore.commit('updateLoginUser', mockUser);

      expect(testStore.state.loginUser).toEqual(mockUser);
    });

    test('updateLoginUser should handle null user', () => {
      testStore.commit('updateLoginUser', null);

      expect(testStore.state.loginUser).toBeNull();
    });

    test('updatePosition should transform positions object to array', () => {
      const mockPositionsObject = {
        'position1': { name: 'formation1', position: [1, 2, 3] },
        'position2': { name: 'formation2', position: [4, 5, 6] }
      };

      testStore.commit('updatePosition', mockPositionsObject);

      expect(testStore.state.positions).toHaveLength(2);
      expect(testStore.state.positions[0]).toHaveProperty('name', 'formation1');
      expect(testStore.state.positions[0]).toHaveProperty('position', [1, 2, 3]);
      expect(testStore.state.positions[1]).toHaveProperty('name', 'formation2');
      expect(testStore.state.positions[1]).toHaveProperty('position', [4, 5, 6]);
    });

    test('updatePosition should clear existing positions before adding new ones', () => {
      // 既存のポジションを設定
      testStore.state.positions = [{ name: 'old', position: [] }];

      const mockPositionsObject = {
        'position1': { name: 'new1', position: [1, 2] }
      };

      testStore.commit('updatePosition', mockPositionsObject);

      expect(testStore.state.positions).toHaveLength(1);
      expect(testStore.state.positions[0].name).toBe('new1');
    });

    test('changePositions should update positions from values array', () => {
      const mockPositionsObject = {
        'pos1': { name: 'formation1', position: [] },
        'pos2': { name: 'formation2', position: [] }
      };

      testStore.commit('changePositions', mockPositionsObject);

      const expectedPositions = Object.values(mockPositionsObject);
      expect(testStore.state.positions).toEqual(expectedPositions);
    });
  });

  describe('actions', () => {
    test('logout should commit updateLoginUser with null and call firebase signOut', () => {
      const mockUser = { uid: 'test-uid', email: 'test@example.com' };
      testStore.state.loginUser = mockUser;

      const commitSpy = jest.spyOn(testStore, 'commit');
      const mockSignOut = jest.fn();
      mockFirebase.auth = () => ({ signOut: mockSignOut });

      testStore.dispatch('logout');

      expect(commitSpy).toHaveBeenCalledWith('updateLoginUser', null);
      expect(mockSignOut).toHaveBeenCalled();
    });

    test('login action should handle email and password parameters', async () => {
      const mockEmail = 'test@example.com';
      const mockPassword = 'password123';

      const mockSignInWithEmailAndPassword = jest.fn().mockResolvedValue({});
      const mockOnAuthStateChanged = jest.fn();

      mockFirebase.auth = () => ({
        signInWithEmailAndPassword: mockSignInWithEmailAndPassword,
        onAuthStateChanged: mockOnAuthStateChanged
      });

      await testStore.dispatch('login', {
        email: mockEmail,
        password: mockPassword
      });

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockEmail, mockPassword);
    });
  });

  describe('state initialization', () => {
    test('initial state should have null loginUser and empty positions array', () => {
      expect(testStore.state.loginUser).toBeNull();
      expect(testStore.state.positions).toEqual([]);
    });
  });
});
