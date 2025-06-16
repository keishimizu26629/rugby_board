import { ref, computed } from 'vue';

/**
 * 選択モードの種別
 */
export type SelectionMode = 'normal' | 'rectangle';

/**
 * 選択モード管理機能を提供するコンポーザブル
 * @returns 選択モード管理に関するリアクティブな状態と操作関数
 */
export function useSelectionMode() {
  const currentMode = ref<SelectionMode>('normal');

  /**
   * 現在のモードが矩形選択モードかどうか
   */
  const isRectangleMode = computed(() => currentMode.value === 'rectangle');

  /**
   * モードを設定する
   * @param mode - 設定する選択モード
   */
  const setMode = (mode: SelectionMode): void => {
    currentMode.value = mode;
  };

  /**
   * 通常選択と矩形選択を切り替える
   */
  const toggleMode = (): void => {
    currentMode.value = currentMode.value === 'normal' ? 'rectangle' : 'normal';
  };

  return {
    currentMode,
    isRectangleMode,
    setMode,
    toggleMode,
  };
}
