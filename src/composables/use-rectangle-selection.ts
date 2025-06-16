import { ref, computed } from 'vue';

/**
 * 矩形データの構造
 */
interface RectangleData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isActive: boolean;
}

/**
 * 選択矩形の表示情報
 */
interface SelectionRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 矩形選択機能を提供するコンポーザブル
 * @returns 矩形選択に関するリアクティブな状態と操作関数
 */
export function useRectangleSelection() {
  const rectangle = ref<RectangleData>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isActive: false,
  });

  /**
   * 表示用の矩形情報を算出
   */
  const selectionRectangle = computed<SelectionRectangle>(() => {
    const { startX, startY, endX, endY } = rectangle.value;
    return {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
    };
  });

  /**
   * 矩形選択を開始する
   * @param event - マウスイベント
   */
  const startRectangleSelection = (event: MouseEvent): void => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    rectangle.value = {
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      isActive: true,
    };
  };

  /**
   * 矩形選択を更新する
   * @param event - マウスイベント
   */
  const updateRectangleSelection = (event: MouseEvent): void => {
    if (!rectangle.value.isActive) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    rectangle.value.endX = event.clientX - rect.left;
    rectangle.value.endY = event.clientY - rect.top;
  };

  /**
   * 矩形選択を終了する
   */
  const endRectangleSelection = (): void => {
    rectangle.value.isActive = false;
  };

  /**
   * プレイヤーが矩形内にあるかどうかをチェック
   * @param playerX - プレイヤーのX座標
   * @param playerY - プレイヤーのY座標
   * @returns 矩形内にあるかどうか
   */
  const isPlayerInRectangle = (playerX: number, playerY: number): boolean => {
    const rect = selectionRectangle.value;
    return (
      playerX >= rect.x &&
      playerX <= rect.x + rect.width &&
      playerY >= rect.y &&
      playerY <= rect.y + rect.height
    );
  };

  return {
    rectangle,
    selectionRectangle,
    startRectangleSelection,
    updateRectangleSelection,
    endRectangleSelection,
    isPlayerInRectangle,
  };
}
