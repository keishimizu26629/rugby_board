import { vi } from 'vitest'
import '@testing-library/jest-dom'

// 基本的なテスト環境のセットアップ

// Firebase v10 モック（Vue3対応）
const mockAuth = {
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}

const mockFirestore = {
  collection: vi.fn().mockReturnValue({
    doc: vi.fn().mockReturnValue({
      get: vi.fn(),
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }),
  }),
  runTransaction: vi.fn(),
}

vi.mock('firebase/auth', () => ({
  getAuth: () => mockAuth,
  signInWithEmailAndPassword: mockAuth.signInWithEmailAndPassword,
  signOut: mockAuth.signOut,
  onAuthStateChanged: mockAuth.onAuthStateChanged,
  createUserWithEmailAndPassword: mockAuth.createUserWithEmailAndPassword,
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: () => mockFirestore,
  collection: mockFirestore.collection,
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  runTransaction: mockFirestore.runTransaction,
}))

// Canvas API モック
global.HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}))

// LocalStorage のモック
const localStorageMock = (() => {
  let store = {}

  return {
    getItem: (key) => {
      return store[key] || null
    },
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Console警告を抑制
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
}
