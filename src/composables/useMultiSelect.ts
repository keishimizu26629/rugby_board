import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { SelectedPlayer } from '@/types/rugby';

/**
 * 複数選択機能を管理するコンポーザブル
 * Ctrl+クリック（Windows/Linux）またはCommand+クリック（Mac）による複数選択をサポート
 */
export function useMultiSelect() {
  console.log('🚀 useMultiSelect function called');

  const selectedPlayers = ref<SelectedPlayer[]>([]);
  const selectionCounter = ref(0);

  // グローバルなキーの状態管理
  const isCtrlPressed = ref(false);
  const isMetaPressed = ref(false);

  console.log('📝 useMultiSelect: refs initialized');

  /**
   * 修飾キーが押されているかチェック
   * @returns 複数選択キーが押されているかどうか
   */
  const isMultiSelectKey = (): boolean => {
    const result = isCtrlPressed.value || isMetaPressed.value;
    console.log('isMultiSelectKey check:', {
      isCtrlPressed: isCtrlPressed.value,
      isMetaPressed: isMetaPressed.value,
      result
    });
    return result;
  };

  // キーボードイベントハンドラー
  const handleKeyDown = (event: KeyboardEvent) => {
    console.log('🔥 useMultiSelect Key down:', {
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      platform: navigator.platform
    });

    if (event.key === 'Control') {
      isCtrlPressed.value = true;
      console.log('⚡ Control key pressed');
    }
    if (event.key === 'Meta' || event.key === 'Cmd') {
      isMetaPressed.value = true;
      console.log('⚡ Meta key pressed');
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    console.log('🔥 useMultiSelect Key up:', {
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey
    });

    if (event.key === 'Control') {
      isCtrlPressed.value = false;
      console.log('⚡ Control key released');
    }
    if (event.key === 'Meta' || event.key === 'Cmd') {
      isMetaPressed.value = false;
      console.log('⚡ Meta key released');
    }
  };

  // コンポーネントマウント時にイベントリスナーを追加
  onMounted(() => {
    console.log('🎯 useMultiSelect onMounted called - adding keyboard listeners');

    try {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      console.log('✅ useMultiSelect: Window event listeners added successfully');

      // ブラー時にキーの状態をリセット
      window.addEventListener('blur', () => {
        console.log('Window blur - resetting key states');
        isCtrlPressed.value = false;
        isMetaPressed.value = false;
      });

      // テスト用：3秒後にテストメッセージ
      setTimeout(() => {
        console.log('🧪 useMultiSelect test: Still alive after 3 seconds');
      }, 3000);

    } catch (error) {
      console.error('❌ useMultiSelect: Error adding event listeners:', error);
    }
  });

  onUnmounted(() => {
    console.log('🎯 useMultiSelect onUnmounted called - removing keyboard listeners');
    try {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      console.log('✅ useMultiSelect: Event listeners removed successfully');
    } catch (error) {
      console.error('❌ useMultiSelect: Error removing event listeners:', error);
    }
  });

  /**
   * プレイヤーの選択状態を切り替える
   * @param playerId - プレイヤーID
   * @param teamIndex - チームインデックス
   * @param playerIndex - プレイヤーインデックス
   * @param forceMultiSelect - 強制的に複数選択モードにするか
   */
  const selectPlayer = (
    playerId: string,
    teamIndex: number,
    playerIndex: number,
    forceMultiSelect?: boolean
  ): void => {
    try {
      const isMultiSelect = forceMultiSelect ?? isMultiSelectKey();

      console.log('useMultiSelect - selectPlayer called:', {
        playerId,
        teamIndex,
        playerIndex,
        isMultiSelect,
        forceMultiSelect,
        isCtrlPressed: isCtrlPressed.value,
        isMetaPressed: isMetaPressed.value,
        currentSelection: selectedPlayers.value.map(p => ({ id: p.id, order: p.order }))
      });

      if (!isMultiSelect) {
        // 単一選択：他を全て解除
        selectedPlayers.value = [
          {
            id: playerId,
            teamIndex,
            playerIndex,
            order: ++selectionCounter.value,
          },
        ];
        console.log('Single selection applied:', selectedPlayers.value);
      } else {
        // 複数選択：トグル動作
        const index = selectedPlayers.value.findIndex((p) => p.id === playerId);
        if (index > -1) {
          // 既に選択されている場合は解除
          selectedPlayers.value.splice(index, 1);
          console.log('Player deselected:', playerId, 'remaining:', selectedPlayers.value);
        } else {
          // 新しく選択
          selectedPlayers.value.push({
            id: playerId,
            teamIndex,
            playerIndex,
            order: ++selectionCounter.value,
          });
          console.log('Player added to selection:', playerId, 'total:', selectedPlayers.value);
        }
      }
    } catch (error) {
      console.error('Error selecting player:', error);
    }
  };

  /**
   * 全選択を解除
   */
  const clearSelection = (): void => {
    selectedPlayers.value = [];
    selectionCounter.value = 0;
  };

  /**
   * プレイヤーが選択されているかチェック
   * @param playerId - プレイヤーID
   * @returns 選択されているかどうか
   */
  const isPlayerSelected = (playerId: string): boolean => {
    return selectedPlayers.value.some((p) => p.id === playerId);
  };

  /**
   * 選択順序を取得
   * @param playerId - プレイヤーID
   * @returns 選択順序（0の場合は選択されていない）
   */
  const getSelectionOrder = (playerId: string): number => {
    const player = selectedPlayers.value.find((p) => p.id === playerId);
    return player?.order || 0;
  };

  /**
   * 複数選択されているかどうか
   */
  const isMultiSelected = computed(() => selectedPlayers.value.length > 1);

  /**
   * 選択されているプレイヤー数
   */
  const selectedCount = computed(() => selectedPlayers.value.length);

  return {
    selectedPlayers,
    isMultiSelectKey,
    selectPlayer,
    clearSelection,
    isPlayerSelected,
    getSelectionOrder,
    isMultiSelected: isMultiSelected,
    selectedCount,
    // キーの状態を公開（デバッグ用）
    isCtrlPressed,
    isMetaPressed,
  };
}
