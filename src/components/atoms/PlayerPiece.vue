<template>
  <div
    class="player-piece"
    :class="[
      `player-${team}`,
      {
        dragging: isDragging,
        selected: isSelected && !isMultiSelected,
        'multi-selected': isMultiSelected,
      },
    ]"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      transform: `translate(-50%, -50%)`
    }"
    :data-selection-order="selectionOrder"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @click="onClick"
  >
    <span
      v-if="showNumber"
      class="player-number"
    >{{ number }}</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PlayerPiece'
});

interface Props {
  id: string;
  number: number;
  team: 'my-team' | 'opponent';
  x: number;
  y: number;
  showNumber?: boolean;
  isDragging?: boolean;
  isSelected?: boolean;
  isMultiSelected?: boolean;
  selectionOrder?: number;
}

interface Emits {
  (e: 'mousedown', event: MouseEvent, playerId: string): void;
  (e: 'mouseup', event: MouseEvent, playerId: string): void;
  (e: 'click', event: MouseEvent, playerId: string, isMultiSelect: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  showNumber: true,
  isDragging: false,
  isSelected: false,
  isMultiSelected: false,
  selectionOrder: 0,
});

const emit = defineEmits<Emits>();

const onMouseDown = (event: MouseEvent) => {
  emit('mousedown', event, props.id);
};

const onMouseUp = (event: MouseEvent) => {
  emit('mouseup', event, props.id);
};

const onClick = (event: MouseEvent) => {
  // 修飾キーの状態を正しく検知
  const isMultiSelect = event.ctrlKey || event.metaKey;

  // デバッグ用のコンソール出力
  console.log('PlayerPiece clicked:', {
    playerId: props.id,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    isMultiSelect: isMultiSelect,
    platform: navigator.platform
  });

  // 修飾キーの状態を正しく伝達
  emit('click', event, props.id, isMultiSelect);
};
</script>

<style scoped>
.player-piece {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  border: 2px solid transparent;
}

.player-my-team {
  background-color: #2196F3;
  border-color: #1976D2;
  color: white;
}

.player-opponent {
  background-color: #F44336;
  border-color: #D32F2F;
  color: white;
}

/* 未選択状態のホバー */
.player-piece:hover:not(.selected):not(.multi-selected) {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 単一選択状態 */
.player-piece.selected {
  border: 3px solid #ffd700;
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.3), 0 0 15px rgba(255, 215, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 25;
}

/* チェックマーク */
.player-piece.selected::after {
  content: "✓";
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 30;
  animation: checkmarkAppear 0.3s ease-out;
}

/* 複数選択状態 */
.player-piece.multi-selected {
  border: 3px solid #00ced1;
  background: linear-gradient(
    135deg,
    rgba(0, 206, 209, 0.15) 0%,
    rgba(0, 206, 209, 0.05) 100%
  );
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 0 0 1px rgba(0, 206, 209, 0.4), 0 0 12px rgba(0, 206, 209, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 20;
}

/* 複数選択のチェックマーク */
.player-piece.multi-selected::after {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

/* 複数選択の順序バッジ */
.player-piece.multi-selected::before {
  content: attr(data-selection-order);
  position: absolute;
  top: -10px;
  left: -10px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border-radius: 50%;
  font-size: 9px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 31;
}

/* アニメーション */
@keyframes checkmarkAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ドラッグ中の状態 */
.player-piece.dragging {
  transform: translate(-50%, -50%) scale(1.15) rotate(5deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  z-index: 40;
}

/* 複数選択でドラッグ中 */
.player-piece.multi-selected.dragging {
  animation: multiDragPulse 0.5s ease-in-out infinite alternate;
}

@keyframes multiDragPulse {
  from {
    box-shadow: 0 0 0 1px rgba(0, 206, 209, 0.4), 0 8px 25px rgba(0, 0, 0, 0.4);
  }
  to {
    box-shadow: 0 0 0 3px rgba(0, 206, 209, 0.6), 0 8px 25px rgba(0, 206, 209, 0.3);
  }
}

.player-number {
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  position: relative;
  z-index: 10;
}
</style>
