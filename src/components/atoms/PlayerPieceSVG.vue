<template>
  <g
    class="player-piece-svg"
    :class="[
      `team-${team}`,
      {
        'selected': isSelected && !isMultiSelected,
        'multi-selected': isMultiSelected,
        'dragging': isDragging,
        'hover': isHovered,
      }
    ]"
    :transform="`translate(${logicalX}, ${logicalY})`"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @click="onClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- プレイヤー円 -->
    <circle
      :r="radius"
      class="player-circle"
    />

    <!-- 選択状態のリング -->
    <circle
      v-if="isSelected || isMultiSelected"
      :r="radius + 2"
      class="selection-ring"
      :class="{
        'single-selection': isSelected && !isMultiSelected,
        'multi-selection': isMultiSelected,
      }"
    />

    <!-- 選択順序バッジ -->
    <g v-if="isMultiSelected && selectionOrder > 0" class="selection-order-badge">
      <circle
        :cx="-radius - 3"
        :cy="-radius - 3"
        r="6"
        class="order-circle"
      />
      <text
        :x="-radius - 3"
        :y="-radius - 3"
        class="order-text"
        dominant-baseline="central"
        text-anchor="middle"
      >
        {{ selectionOrder }}
      </text>
    </g>

    <!-- チェックマーク -->
    <g v-if="isSelected" class="checkmark">
      <circle
        :cx="radius + 3"
        :cy="-radius - 3"
        r="6"
        class="check-circle"
      />
      <text
        :x="radius + 3"
        :y="-radius - 3"
        class="check-text"
        dominant-baseline="central"
        text-anchor="middle"
      >
        ✓
      </text>
    </g>

    <!-- 背番号 -->
    <text
      v-if="showNumber"
      x="0"
      y="0"
      class="player-number"
      dominant-baseline="central"
      text-anchor="middle"
    >
      {{ number }}
    </text>

    <!-- ホバー効果リング -->
    <circle
      v-if="isHovered && !isSelected && !isMultiSelected"
      :r="radius + 1"
      class="hover-ring"
    />

    <!-- ドラッグ中の影効果 -->
    <circle
      v-if="isDragging"
      :r="radius"
      class="drag-shadow"
    />
  </g>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LogicalPosition } from '@/composables/useViewport';

defineOptions({
  name: 'PlayerPieceSVG'
});

interface Props {
  id: string;
  number: number;
  team: 'my-team' | 'opponent';
  logicalX: number;
  logicalY: number;
  showNumber?: boolean;
  isDragging?: boolean;
  isSelected?: boolean;
  isMultiSelected?: boolean;
  selectionOrder?: number;
  scale?: number; // ビューポートスケールに応じてサイズ調整
}

interface Emits {
  (e: 'mousedown', event: MouseEvent, playerId: string): void;
  (e: 'mouseup', event: MouseEvent, playerId: string): void;
  (e: 'click', event: MouseEvent, playerId: string, isMultiSelect: boolean): void;
  (e: 'drag', playerId: string, newPosition: LogicalPosition): void;
}

const props = withDefaults(defineProps<Props>(), {
  showNumber: true,
  isDragging: false,
  isSelected: false,
  isMultiSelected: false,
  selectionOrder: 0,
  scale: 1.0,
});

const emit = defineEmits<Emits>();

// 内部状態
const isHovered = ref(false);

// 計算されたプロパティ
const radius = computed(() => {
  // スケールに応じてサイズを調整（最小・最大サイズを制限）
  const baseRadius = 12;
  const scaledRadius = baseRadius / Math.sqrt(props.scale);
  return Math.max(6, Math.min(24, scaledRadius));
});

// イベントハンドラー
const onMouseDown = (event: MouseEvent) => {
  event.stopPropagation();
  emit('mousedown', event, props.id);
};

const onMouseUp = (event: MouseEvent) => {
  event.stopPropagation();
  emit('mouseup', event, props.id);
};

const onClick = (event: MouseEvent) => {
  event.stopPropagation();

  // 修飾キーの状態を検知
  const isMultiSelect = event.ctrlKey || event.metaKey;

  emit('click', event, props.id, isMultiSelect);
};

const onMouseEnter = () => {
  isHovered.value = true;
};

const onMouseLeave = () => {
  isHovered.value = false;
};
</script>

<style scoped>
.player-piece-svg {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.player-circle {
  fill: var(--player-color);
  stroke: var(--player-border-color);
  stroke-width: 1.5;
  transition: all 0.2s ease;
}

/* チーム色 */
.team-my-team {
  --player-color: #2196F3;
  --player-border-color: #1976D2;
  --player-text-color: white;
}

.team-opponent {
  --player-color: #F44336;
  --player-border-color: #D32F2F;
  --player-text-color: white;
}

/* 選択状態のリング */
.selection-ring {
  fill: none;
  stroke-width: 2;
  animation: selectionPulse 2s ease-in-out infinite;
}

.selection-ring.single-selection {
  stroke: #ffd700;
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6));
}

.selection-ring.multi-selection {
  stroke: #00ced1;
  filter: drop-shadow(0 0 4px rgba(0, 206, 209, 0.6));
}

/* 選択順序バッジ */
.order-circle {
  fill: #6c757d;
  stroke: white;
  stroke-width: 1;
}

.order-text {
  fill: white;
  font-size: 8px;
  font-weight: bold;
}

/* チェックマーク */
.check-circle {
  fill: #28a745;
  stroke: white;
  stroke-width: 1;
}

.check-text {
  fill: white;
  font-size: 8px;
  font-weight: bold;
}

/* 背番号 */
.player-number {
  fill: var(--player-text-color);
  font-size: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
  pointer-events: none;
  user-select: none;
}

/* ホバー効果 */
.hover-ring {
  fill: none;
  stroke: rgba(255, 255, 255, 0.6);
  stroke-width: 2;
  animation: hoverPulse 1s ease-in-out infinite alternate;
}

/* ドラッグ中の影 */
.drag-shadow {
  fill: rgba(0, 0, 0, 0.3);
  transform: translate(2px, 2px);
  pointer-events: none;
}

/* 状態別スタイル */
.player-piece-svg.selected .player-circle {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.player-piece-svg.multi-selected .player-circle {
  transform: scale(1.05);
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
}

.player-piece-svg.dragging {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  transform: scale(1.1) rotate(3deg);
}

.player-piece-svg.hover:not(.selected):not(.multi-selected) .player-circle {
  transform: scale(1.05);
}

/* アニメーション */
@keyframes selectionPulse {
  0%, 100% {
    opacity: 1;
    stroke-width: 2;
  }
  50% {
    opacity: 0.7;
    stroke-width: 3;
  }
}

@keyframes hoverPulse {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 0.8;
  }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .player-number {
    font-size: 8px;
  }

  .order-text,
  .check-text {
    font-size: 6px;
  }
}
</style>
