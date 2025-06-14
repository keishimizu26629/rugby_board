<template>
  <div
    class="player-piece"
    :class="[`player-${team}`, { 'dragging': isDragging }]"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      transform: `translate(-50%, -50%)`
    }"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
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
}

interface Emits {
  (e: 'mousedown', event: MouseEvent, playerId: string): void;
  (e: 'mouseup', event: MouseEvent, playerId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  showNumber: true,
  isDragging: false
});

const emit = defineEmits<Emits>();

const onMouseDown = (event: MouseEvent) => {
  emit('mousedown', event, props.id);
};

const onMouseUp = (event: MouseEvent) => {
  emit('mouseup', event, props.id);
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
  cursor: move;
  user-select: none;
  transition: all 0.2s ease;
  z-index: 10;
}

.player-my-team {
  background-color: #2196F3;
  border: 2px solid #1976D2;
  color: white;
}

.player-opponent {
  background-color: #F44336;
  border: 2px solid #D32F2F;
  color: white;
}

.player-piece:hover {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.player-piece.dragging {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  z-index: 20;
}

.player-number {
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
}
</style>
