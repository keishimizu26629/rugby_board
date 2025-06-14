import type { FirebaseOptions } from 'firebase/app';

/**
 * Firebase設定を返す関数
 * @returns Firebase設定オブジェクト
 */
export default function(): FirebaseOptions {
  return {
    apiKey: "AIzaSyCH58r7rQrY3tK9lz68RkCvlq-6QVzWq40",
    authDomain: "rugby-board.firebaseapp.com",
    projectId: "rugby-board",
    storageBucket: "rugby-board.appspot.com",
    messagingSenderId: "984035006338",
    appId: "1:984035006338:web:4d0fa13287367633bb219b"
  };
}
