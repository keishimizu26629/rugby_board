import { ref, inject } from 'vue';
import type { BoardRepository } from '@/types/boardRepository';
import type { Player, Position, Marker, BoardSettings, LineSettings } from '@/types/rugby';

export function useBoard() {
  const boardRepo = inject<BoardRepository>('boardRepo')!;

  const players = ref<Player[][]>([[], []]);
  const markers = ref<Marker[]>([]);
  const positions = ref<Position[]>([]);
  const selectedPosition = ref<string>('');
  const boardSettings = ref<BoardSettings>({
    showLines: true,
    showNumbers: true
  });
  const lineSettings = ref<LineSettings>({
    width: 2,
    color: '#000000'
  });
  const isLoading = ref(false);
  const error = ref<string>('');

  const addPlayer = (team: 0 | 1, number: number): void => {
    const newPlayer: Player = {
      id: `${team}-${number}-${Date.now()}`,
      number,
      team: team === 0 ? 'my-team' : 'opponent',
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300
    };

    players.value[team].push(newPlayer);
  };

  const movePlayer = (playerId: string, x: number, y: number): void => {
    for (const team of players.value) {
      const player = team.find(p => p.id === playerId);
      if (player) {
        player.x = x;
        player.y = y;
        break;
      }
    }
  };

  const removePlayer = (playerId: string): void => {
    for (let i = 0; i < players.value.length; i++) {
      const index = players.value[i].findIndex(p => p.id === playerId);
      if (index > -1) {
        players.value[i].splice(index, 1);
        break;
      }
    }
  };

  const clearPlayers = (): void => {
    players.value = [[], []];
  };

  const addMarker = (x: number, y: number): void => {
    const newMarker: Marker = {
      index: markers.value.length,
      x,
      y
    };
    markers.value.push(newMarker);
  };

  const removeMarker = (index?: number): void => {
    if (index !== undefined) {
      markers.value.splice(index, 1);
      // インデックスを再計算
      markers.value.forEach((marker, i) => {
        marker.index = i;
      });
    } else {
      // 最後のマーカーを削除
      markers.value.pop();
    }
  };

  const savePosition = async (userId: string, positionName: string): Promise<void> => {
    isLoading.value = true;
    error.value = '';

    try {
      const allPlayers = [...players.value[0], ...players.value[1]];
      const position: Position = {
        name: positionName,
        players: allPlayers
      };

      await boardRepo.savePosition(userId, position);

      // ローカル状態も更新
      const existingIndex = positions.value.findIndex(p => p.name === positionName);
      if (existingIndex > -1) {
        positions.value[existingIndex] = position;
      } else {
        positions.value.push(position);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '配置の保存でエラーが発生しました';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadPositions = async (userId: string): Promise<void> => {
    isLoading.value = true;
    error.value = '';

    try {
      positions.value = await boardRepo.getPositions(userId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : '配置の読み込みでエラーが発生しました';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deletePosition = async (userId: string, positionName: string): Promise<void> => {
    isLoading.value = true;
    error.value = '';

    try {
      await boardRepo.deletePosition(userId, positionName);

      // ローカル状態も更新
      const index = positions.value.findIndex(p => p.name === positionName);
      if (index > -1) {
        positions.value.splice(index, 1);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '配置の削除でエラーが発生しました';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const applyPosition = (positionName: string): void => {
    const position = positions.value.find(p => p.name === positionName);
    if (position) {
      // プレイヤーを分離
      const myTeamPlayers = position.players.filter(p => p.team === 'my-team');
      const opponentPlayers = position.players.filter(p => p.team === 'opponent');

      players.value = [myTeamPlayers, opponentPlayers];
      selectedPosition.value = positionName;
    }
  };

  const toggleBoardSetting = (setting: keyof BoardSettings): void => {
    boardSettings.value[setting] = !boardSettings.value[setting];
  };

  const updateLineSettings = (settings: Partial<LineSettings>): void => {
    Object.assign(lineSettings.value, settings);
  };

  const clearError = (): void => {
    error.value = '';
  };

  return {
    players,
    markers,
    positions,
    selectedPosition,
    boardSettings,
    lineSettings,
    isLoading,
    error,
    addPlayer,
    movePlayer,
    removePlayer,
    clearPlayers,
    addMarker,
    removeMarker,
    savePosition,
    loadPositions,
    deletePosition,
    applyPosition,
    toggleBoardSetting,
    updateLineSettings,
    clearError
  };
}
