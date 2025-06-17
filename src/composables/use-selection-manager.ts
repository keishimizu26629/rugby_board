import { useSelectionMode } from './use-selection-mode';
import { useMultiSelect } from './useMultiSelect';
import { useRectangleSelection } from './use-rectangle-selection';
import type { Player } from '@/types/rugby';

/**
 * 選択機能を統合管理するコンポーザブル
 * @returns 選択に関する全ての機能を統合したインターフェース
 */
export function useSelectionManager() {
  const { currentMode, isRectangleMode, setMode, toggleMode } = useSelectionMode();
  const { selectedPlayers, selectPlayer, clearSelection, isPlayerSelected } = useMultiSelect();
  const {
    rectangle,
    selectionRectangle,
    startRectangleSelection,
    updateRectangleSelection,
    endRectangleSelection,
    isPlayerInRectangle,
  } = useRectangleSelection();

  /**
   * 矩形選択を完了し、矩形内のプレイヤーを全て選択する
   * @param players - 2次元配列形式のプレイヤーデータ（teams[teamIndex][playerIndex]）
   */
  const completeRectangleSelection = (players: Player[][]): void => {
    if (!rectangle.value.isActive) return;

    // 既存選択をクリア
    clearSelection();

    // 矩形内のプレイヤーを選択
    players.forEach((team, teamIndex) => {
      team.forEach((player, playerIndex) => {
        if (player.id && isPlayerInRectangle(player.x, player.y)) {
          selectPlayer(player.id, teamIndex, playerIndex, true);
        }
      });
    });

    endRectangleSelection();
  };

  return {
    // モード管理
    currentMode,
    isRectangleMode,
    setMode,
    toggleMode,

    // 矩形選択
    rectangle,
    selectionRectangle,
    startRectangleSelection,
    updateRectangleSelection,
    completeRectangleSelection,

    // プレイヤー選択
    selectedPlayers,
    selectPlayer,
    clearSelection,
    isPlayerSelected,
  };
}
