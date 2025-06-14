<template>
  <canvas
    id="canvas"
    ref="drawCanvas"
    width="660"
    height="580"
    class="drawing-canvas"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'DrawingCanvas'
});

import { ref, onMounted } from 'vue';
import type { LineSettings } from '@/types/rugby';

interface Props {
  lineSettings: LineSettings;
}

const props = defineProps<Props>();

const drawCanvas = ref<HTMLCanvasElement>();

const getContext = (): CanvasRenderingContext2D | null => {
  return drawCanvas.value?.getContext('2d') || null;
};

const clear = () => {
  const ctx = getContext();
  if (ctx) {
    ctx.clearRect(0, 0, 660, 580);
  }
};

defineExpose({
  getContext,
  clear
});

onMounted(() => {
  const ctx = getContext();
  if (ctx) {
    // 描画設定を初期化
    ctx.lineWidth = props.lineSettings.width;
    ctx.strokeStyle = props.lineSettings.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
});
</script>

<style scoped>
.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  pointer-events: none;
}
</style>
