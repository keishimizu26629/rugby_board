import { ref } from 'vue';

interface DraggedElement {
  id: string;
  type: 'player' | 'marker';
}

/**
 * ドラッグ&ドロップ機能を提供するコンポーザブル
 */
export function useDragAndDrop() {
  const isDragging = ref(false);
  const dragTarget = ref<HTMLElement | null>(null);
  const draggedElement = ref<DraggedElement | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });

  /**
   * ドラッグ開始処理
   * @param event - マウスイベント
   * @param elementId - ドラッグ対象の要素ID
   * @param type - ドラッグ対象のタイプ
   */
  const startDrag = (
    event: MouseEvent,
    elementId: string,
    type: 'player' | 'marker'
  ) => {
    isDragging.value = true;
    const element = event.target as HTMLElement;
    dragTarget.value = element;
    draggedElement.value = { id: elementId, type: type };

    const rect = element.getBoundingClientRect();
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  /**
   * ドラッグ中の処理
   */
  const drag = () => {
    // 現在未実装
  };

  /**
   * ドラッグ終了処理
   * @param _event - マウスイベント（オプション、現在未使用）
   */
  const endDrag = (_event?: MouseEvent) => {
    isDragging.value = false;
    dragTarget.value = null;
    draggedElement.value = null;
    dragOffset.value = { x: 0, y: 0 };
  };

  return {
    isDragging,
    dragTarget,
    draggedElement,
    dragOffset,
    startDrag,
    drag,
    endDrag
  };
}
