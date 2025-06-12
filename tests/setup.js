// 基本的なテスト環境のセットアップ

// Firebase認証のモック（基本版）
global.firebase = {
  auth: () => ({
    onAuthStateChanged: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
  }),
  firestore: () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn(),
        set: jest.fn(),
      }),
    }),
    runTransaction: jest.fn(),
  }),
};

// LocalStorage のモック
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => {
      return store[key] || null;
    },
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Console警告を抑制
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
