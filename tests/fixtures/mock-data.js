// テスト用のモックデータ

export const mockUser = {
  uid: 'test-user-uid',
  email: 'test@example.com',
  displayName: 'Test User',
};

export const mockPositions = [
  {
    name: 'フォーメーション1',
    position: [
      { x: 100, y: 200, playerNumber: 1 },
      { x: 150, y: 250, playerNumber: 2 },
      { x: 200, y: 300, playerNumber: 3 },
    ],
  },
  {
    name: 'フォーメーション2',
    position: [
      { x: 120, y: 220, playerNumber: 1 },
      { x: 170, y: 270, playerNumber: 2 },
      { x: 220, y: 320, playerNumber: 3 },
    ],
  },
];

export const mockPositionsObject = {
  formation1: {
    name: 'フォーメーション1',
    position: [
      { x: 100, y: 200, team: 'team1' },
      { x: 150, y: 250, team: 'team1' },
      { x: 200, y: 300, team: 'team2' },
    ],
  },
  formation2: {
    name: 'フォーメーション2',
    position: [
      { x: 120, y: 220, team: 'team1' },
      { x: 170, y: 270, team: 'team1' },
      { x: 220, y: 320, team: 'team2' },
    ],
  },
};

export const mockUserAccountData = {
  mailAddress: 'test@example.com',
  password: 'testpassword123',
};

export const mockLoginError = 'ログインエラーが発生しました';

export const mockFirestoreResponse = {
  data: () => ({
    positions: mockPositionsObject,
  }),
};

// Firebase Auth のモック関数
export const createMockFirebaseAuth = () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({ user: mockUser }),
  signOut: jest.fn().mockResolvedValue(),
});

// Firestore のモック関数
export const createMockFirestore = () => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue(mockFirestoreResponse),
      set: jest.fn().mockResolvedValue(),
    })),
  })),
  runTransaction: jest.fn().mockResolvedValue(),
});

// Vuex Store のモック状態
export const mockStoreState = {
  loginUser: mockUser,
  positions: mockPositions,
};

// Vuex Store のモックアクション
export const mockStoreActions = {
  login: jest.fn(),
  logout: jest.fn(),
  autoLogin: jest.fn(),
  fetchData: jest.fn(),
  testPost: jest.fn(),
  testDelete: jest.fn(),
};

// Vuex Store のモックGetters
export const mockStoreGetters = {
  loginUser: () => mockUser,
  positions: () => mockPositions,
  loginError: () => null,
};

// Vuex Store のモックMutations
export const mockStoreMutations = {
  updateLoginUser: jest.fn(),
  updatePosition: jest.fn(),
  changePositions: jest.fn(),
};

// Vue Router のモック
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

// Canvas Context のモック
export const createMockCanvasContext = () => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
});

// LocalStorage のモック
export const createMockLocalStorage = () => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
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
};
