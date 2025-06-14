<template>
  <canvas
    id="ground"
    ref="fieldCanvas"
    width="660"
    height="580"
    class="rugby-field"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'RugbyField'
});

import { ref, onMounted, watch } from 'vue';

interface Props {
  showLines?: boolean;
}

interface Emits {
  (e: 'draw-start', event: MouseEvent): void;
  (e: 'draw-move', event: MouseEvent): void;
  (e: 'draw-end', event: MouseEvent): void;
}

const props = withDefaults(defineProps<Props>(), {
  showLines: true
});

const emit = defineEmits<Emits>();

const fieldCanvas = ref<HTMLCanvasElement>();

const drawField = () => {
  const canvas = fieldCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // キャンバスをクリア
  ctx.clearRect(0, 0, 660, 580);

  if (props.showLines) {
    // ラグビーフィールドの線を描画
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    // 外枠
    ctx.strokeRect(50, 50, 560, 480);

    // ゴールライン
    ctx.beginPath();
    ctx.moveTo(50, 100);
    ctx.lineTo(610, 100);
    ctx.moveTo(50, 480);
    ctx.lineTo(610, 480);
    ctx.stroke();

    // 22mライン
    ctx.beginPath();
    ctx.moveTo(50, 150);
    ctx.lineTo(610, 150);
    ctx.moveTo(50, 430);
    ctx.lineTo(610, 430);
    ctx.stroke();

    // センターライン
    ctx.beginPath();
    ctx.moveTo(50, 290);
    ctx.lineTo(610, 290);
    ctx.stroke();

    // センターマーク
    ctx.beginPath();
    ctx.arc(330, 290, 10, 0, 2 * Math.PI);
    ctx.stroke();
  }
};

const onMouseDown = (event: MouseEvent) => {
  emit('draw-start', event);
};

const onMouseMove = (event: MouseEvent) => {
  emit('draw-move', event);
};

const onMouseUp = (event: MouseEvent) => {
  emit('draw-end', event);
};

onMounted(() => {
  drawField();
});

watch(() => props.showLines, () => {
  drawField();
});
</script>

<style scoped>
.rugby-field {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #4CAF50;
  z-index: 1;
  cursor: crosshair;
}
</style>
