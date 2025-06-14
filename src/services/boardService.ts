import type { BoardRepository } from '@/types/boardRepository';
import type { Position } from '@/types/rugby';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getFirestore
} from 'firebase/firestore';

/**
 * ボード関連のサービス実装
 */
export class BoardService implements BoardRepository {
  private db = getFirestore();

  async getPositions(userId: string): Promise<Position[]> {
    const snapshot = await getDocs(collection(this.db, 'users', userId, 'positions'));
    return snapshot.docs.map(doc => doc.data() as Position);
  }

  async savePosition(userId: string, position: Position): Promise<void> {
    const docRef = doc(this.db, 'users', userId, 'positions', position.name);
    await updateDoc(docRef, {
      name: position.name,
      players: position.players
    });
  }

  async deletePosition(userId: string, positionName: string): Promise<void> {
    const docRef = doc(this.db, 'users', userId, 'positions', positionName);
    await deleteDoc(docRef);
  }
}
