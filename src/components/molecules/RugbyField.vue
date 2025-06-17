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

/**
 * 詳細なラグビーフィールドを描画
 */
const drawField = () => {
  const canvas = fieldCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // キャンバスをクリア
  ctx.clearRect(0, 0, 660, 580);

  if (props.showLines) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;

    let can_width = 660;
    let can_height = 580;
    let ground_leftRight = 30;
    let ground_topBottom = 10;

    // グランドの描画
    ctx.strokeRect(
      ground_leftRight, ground_topBottom,
      can_width - (ground_leftRight * 2), can_height - (ground_topBottom * 2)
    );

    ctx.beginPath();
    // ポール
    ctx.moveTo(200 / 440 * can_width,70); ctx.lineTo(200 / 440 * can_width,30);
    ctx.moveTo(240 / 440 * can_width,70); ctx.lineTo(240 / 440 * can_width,30);
    ctx.moveTo(200 / 440 * can_width,55); ctx.lineTo(240 / 440 * can_width,55);

    ctx.moveTo(200 / 440 * can_width,510); ctx.lineTo(200 / 440 * can_width,550);
    ctx.moveTo(240 / 440 * can_width,510); ctx.lineTo(240 / 440 * can_width,550);
    ctx.moveTo(200 / 440 * can_width,525); ctx.lineTo(240 / 440 * can_width,525);
    ctx.lineWidth = 6;
    ctx.stroke();

    // インゴール
    ctx.moveTo(ground_leftRight,70); ctx.lineTo(can_width - ground_leftRight,70);
    ctx.moveTo(ground_leftRight,510); ctx.lineTo(can_width - ground_leftRight,510);
    ctx.lineWidth = 3;
    ctx.stroke();

    // 5m実線
    ctx.moveTo(48 / 440 * can_width,94); ctx.lineTo(72 / 440 * can_width,94);
    ctx.moveTo(368 / 440 * can_width,94); ctx.lineTo(392 / 440 * can_width,94);
    ctx.moveTo(48 / 440 * can_width,486); ctx.lineTo(72 / 440 * can_width,486);
    ctx.moveTo(368 / 440 * can_width,486); ctx.lineTo(392 / 440 * can_width,486);

    // ポール5m
    ctx.moveTo(176 / 440 * can_width,94); ctx.lineTo(200 / 440 * can_width,94);
    ctx.moveTo(240 / 440 * can_width,94); ctx.lineTo(264 / 440 * can_width,94);
    ctx.moveTo(176 / 440 * can_width,486); ctx.lineTo(200 / 440 * can_width,486);
    ctx.moveTo(240 / 440 * can_width,486); ctx.lineTo(264 / 440 * can_width,486);

    // 15m実線
    ctx.moveTo(120 / 440 * can_width,70); ctx.lineTo(120 / 440 * can_width,95);
    ctx.moveTo(108 / 440 * can_width,94); ctx.lineTo(132 / 440 * can_width,94);
    ctx.moveTo(320 / 440 * can_width,70); ctx.lineTo(320 / 440 * can_width,95);
    ctx.moveTo(308 / 440 * can_width,94); ctx.lineTo(332 / 440 * can_width,94);
    ctx.moveTo(120 / 440 * can_width,510); ctx.lineTo(120 / 440 * can_width,485);
    ctx.moveTo(108 / 440 * can_width,486); ctx.lineTo(132 / 440 * can_width,486);
    ctx.moveTo(320 / 440 * can_width,510); ctx.lineTo(320 / 440 * can_width,485);
    ctx.moveTo(308 / 440 * can_width,486); ctx.lineTo(332 / 440 * can_width,486);

    // 22mライン
    ctx.moveTo(ground_leftRight,157); ctx.lineTo(can_width - ground_leftRight,157);
    ctx.moveTo(ground_leftRight,413); ctx.lineTo(can_width - ground_leftRight,413);

    // ハーフライン
    ctx.moveTo(ground_leftRight,290); ctx.lineTo(can_width - ground_leftRight,290);
    ctx.lineWidth = 3;
    ctx.stroke();

    // 10mライン
    ctx.beginPath();
    ctx.moveTo(ground_leftRight,244); ctx.lineTo(can_width - ground_leftRight,244);
    ctx.moveTo(ground_leftRight,336); ctx.lineTo(can_width - ground_leftRight,336);

    // 5m点線
    ctx.moveTo(60 / 440 * can_width,103); ctx.lineTo(60 / 440 * can_width,479);
    ctx.moveTo(380 / 440 * can_width,103); ctx.lineTo(380 / 440 * can_width,479);
    ctx.moveTo(120 / 440 * can_width,103); ctx.lineTo(120 / 440 * can_width,479);
    ctx.moveTo(320 / 440 * can_width,103); ctx.lineTo(320 / 440 * can_width,479);
    ctx.setLineDash([8, 10]);
    ctx.stroke();

    ctx.setLineDash([]);
  }
};

// マウスイベントハンドラー
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
  background-color: #0CD30C;
  z-index: 1;
  cursor: crosshair;
  max-width: 100%;
  max-height: 100%;
  border: 2px solid #333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
