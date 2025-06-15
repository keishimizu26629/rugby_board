import { ref, inject, computed } from 'vue';
import type { BoardRepository } from '@/types/boardRepository';
import type { Player, Position, Marker, BoardSettings, LineSettings } from '@/types/rugby';
import { useMultiSelect } from './useMultiSelect';

export function useBoard() {
  const boardRepo = inject<BoardRepository>('boardRepo')!;

  // 複数選択機能の統合
  const {
    selectedPlayers,
    isMultiSelectKey,
    selectPlayer,
    clearSelection,
    isPlayerSelected,
    getSelectionOrder,
    isMultiSelected,
    selectedCount,
  } = useMultiSelect();

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

  // ドラッグ開始時の初期位置を保存
  const initialPositions = ref<Map<string, { x: number; y: number }>>(new Map());

  const addPlayer = (team: 0 | 1, number: number): void => {
    const newPlayer: Player = {
      id: `${team}-${number}-${Date.now()}`,
      number,
      team: team === 0 ? 'my-team' : 'opponent',
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      zIndex: 10
    };

    players.value[team].push(newPlayer);
  };

  /**
   * プレイヤーのクリック処理
   * @param playerId - プレイヤーID
   * @param isMultiSelect - 複数選択モードかどうか
   */
  const handlePlayerClick = (playerId: string, isMultiSelect: boolean): void => {
    console.log('useBoard - handlePlayerClick called:', {
      playerId,
      isMultiSelect
    });

    const { teamIndex, playerIndex } = findPlayerIndices(playerId);
    console.log('Player indices found:', { teamIndex, playerIndex });

    if (teamIndex !== -1 && playerIndex !== -1) {
      // 修飾キーの状態を正しく使用
      selectPlayer(playerId, teamIndex, playerIndex, isMultiSelect);
    } else {
      console.warn('Player not found:', playerId);
    }
  };

  /**
   * プレイヤーのインデックスを取得
   * @param playerId - プレイヤーID
   * @returns チームインデックスとプレイヤーインデックス
   */
  const findPlayerIndices = (playerId: string): { teamIndex: number; playerIndex: number } => {
    for (let teamIndex = 0; teamIndex < players.value.length; teamIndex++) {
      const playerIndex = players.value[teamIndex].findIndex(p => p.id === playerId);
      if (playerIndex > -1) {
        return { teamIndex, playerIndex };
      }
    }
    return { teamIndex: -1, playerIndex: -1 };
  };

  /**
   * プレイヤーをIDで検索
   * @param playerId - プレイヤーID
   * @returns プレイヤーオブジェクト
   */
  const findPlayerById = (playerId: string): Player | undefined => {
    for (const team of players.value) {
      const player = team.find(p => p.id === playerId);
      if (player) return player;
    }
    return undefined;
  };

  /**
   * 複数選択したプレイヤーのドラッグを開始
   * @param draggedPlayerId - ドラッグされたプレイヤーのID
   */
  const startMultiDrag = (draggedPlayerId: string): void => {
    try {
      // 選択された全プレイヤーの初期位置を保存
      selectedPlayers.value.forEach((selectedPlayer) => {
        const player = findPlayerById(selectedPlayer.id);
        if (player) {
          initialPositions.value.set(selectedPlayer.id, { x: player.x, y: player.y });
        }
      });

      // ドラッグされたプレイヤーが選択されていない場合は単一選択
      if (!isPlayerSelected(draggedPlayerId)) {
        const { teamIndex, playerIndex } = findPlayerIndices(draggedPlayerId);
        if (teamIndex !== -1 && playerIndex !== -1) {
          selectPlayer(draggedPlayerId, teamIndex, playerIndex, false);
          const draggedPlayer = findPlayerById(draggedPlayerId);
          if (draggedPlayer) {
            initialPositions.value.set(draggedPlayerId, { x: draggedPlayer.x, y: draggedPlayer.y });
          }
        }
      }
    } catch (error) {
      console.error('Error starting multi drag:', error);
    }
  };

  /**
   * 選択された複数プレイヤーの同時移動
   * @param draggedPlayerId - ドラッグされたプレイヤーのID
   * @param newX - 新しいX座標
   * @param newY - 新しいY座標
   */
  const moveSelectedPlayers = (draggedPlayerId: string, newX: number, newY: number): void => {
    try {
      const draggedInitialPos = initialPositions.value.get(draggedPlayerId);
      if (!draggedInitialPos) {
        console.warn('Initial position not found for dragged player');
        return;
      }

      // ドラッグ開始時の位置を基準とした差分計算
      const deltaX = newX - draggedInitialPos.x;
      const deltaY = newY - draggedInitialPos.y;

      // 選択された全プレイヤーを相対移動
      selectedPlayers.value.forEach((selectedPlayer) => {
        const player = findPlayerById(selectedPlayer.id);
        const initialPos = initialPositions.value.get(selectedPlayer.id);

        if (player && initialPos) {
          player.x = initialPos.x + deltaX;
          player.y = initialPos.y + deltaY;
        }
      });
    } catch (error) {
      console.error('Error moving selected players:', error);
    }
  };

  const movePlayer = (playerId: string, x: number, y: number): void => {
    if (selectedCount.value > 1) {
      // 複数選択時は同時移動
      moveSelectedPlayers(playerId, x, y);
    } else {
      // 単一プレイヤーの移動
      for (const team of players.value) {
        const player = team.find(p => p.id === playerId);
        if (player) {
          player.x = x;
          player.y = y;
          break;
        }
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
    clearSelection();
    initialPositions.value.clear();
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
      clearSelection();
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

  // 選択状態を含むプレイヤー情報を計算
  const playersWithSelection = computed(() => {
    return players.value.map(team =>
      team.map(player => ({
        ...player,
        isSelected: isPlayerSelected(player.id || ''),
        selectionOrder: getSelectionOrder(player.id || '')
      }))
    );
  });

  return {
    players,
    playersWithSelection,
    markers,
    positions,
    selectedPosition,
    boardSettings,
    lineSettings,
    isLoading,
    error,
    // 複数選択関連
    selectedPlayers,
    selectedCount,
    isMultiSelected,
    handlePlayerClick,
    clearSelection,
    startMultiDrag,
    moveSelectedPlayers,
    // 既存の機能
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
