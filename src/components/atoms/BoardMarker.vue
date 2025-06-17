<template>
  <div
    class="board-marker"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      transform: `translate(-50%, -50%)`
    }"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    {{ index }}
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BoardMarker'
});

interface Props {
  x: number;
  y: number;
  index: number;
}

interface Emits {
  (e: 'mousedown', event: MouseEvent, index: number): void;
  (e: 'mouseup', event: MouseEvent, index: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const onMouseDown = (event: MouseEvent) => {
  emit('mousedown', event, props.index);
};

const onMouseUp = (event: MouseEvent) => {
  emit('mouseup', event, props.index);
};
</script>

<style scoped>
.board-marker {
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: #FF9800;
  border: 2px solid #F57C00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: white;
  cursor: move;
  user-select: none;
  z-index: 15;
  transition: all 0.2s ease;
}

.board-marker:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
</style>
