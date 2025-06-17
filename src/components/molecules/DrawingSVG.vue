<template>
  <g class="drawing-svg">
    <!-- 描画されたストローク -->
    <path
      v-for="stroke in strokes"
      :key="stroke.id"
      :d="stroke.path"
      :stroke="stroke.color"
      :stroke-width="stroke.width"
      :stroke-linecap="stroke.linecap"
      :stroke-linejoin="stroke.linejoin"
      :opacity="stroke.opacity"
      fill="none"
      class="drawing-path"
    />

    <!-- 現在描画中のストローク -->
    <path
      v-if="isDrawing && currentPath"
      :d="currentPath"
      :stroke="currentStroke.color"
      :stroke-width="currentStroke.width"
      :stroke-linecap="currentStroke.linecap"
      :stroke-linejoin="currentStroke.linejoin"
      :opacity="currentStroke.opacity"
      fill="none"
      class="drawing-path current-stroke"
    />
  </g>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { LogicalPosition } from '@/composables/useViewport';

defineOptions({
  name: 'DrawingSVG'
});

/**
 * 描画ストロークの定義
 */
interface DrawingStroke {
  id: string;
  path: string;
  color: string;
  width: number;
  linecap: string;
  linejoin: string;
  opacity: number;
  timestamp: number;
}

/**
 * 描画設定の定義
 */
interface DrawingSettings {
  color: string;
  width: number;
  opacity?: number;
  linecap?: string;
  linejoin?: string;
}

interface Props {
  lineSettings: DrawingSettings;
  scale?: number;
  isEnabled?: boolean;
}

interface Emits {
  (e: 'drawing-start', position: LogicalPosition): void;
  (e: 'drawing-move', position: LogicalPosition): void;
  (e: 'drawing-end', stroke: DrawingStroke): void;
  (e: 'strokes-change', strokes: DrawingStroke[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  scale: 1.0,
  isEnabled: true,
});

const emit = defineEmits<Emits>();

// 描画状態
const isDrawing = ref(false);
const strokes = ref<DrawingStroke[]>([]);
const currentPath = ref('');
const currentStrokeId = ref('');

// 現在の描画設定
const currentStroke = computed(() => ({
  color: props.lineSettings.color || '#ffffff',
  width: (props.lineSettings.width || 4) / Math.sqrt(props.scale), // スケールに応じて調整
  linecap: props.lineSettings.linecap || 'round',
  linejoin: props.lineSettings.linejoin || 'round',
  opacity: props.lineSettings.opacity || 1.0,
}));

/**
 * 描画開始
 */
const startDrawing = (position: LogicalPosition) => {
  if (!props.isEnabled) return;

  isDrawing.value = true;
  currentStrokeId.value = `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  currentPath.value = `M ${position.x} ${position.y}`;

  emit('drawing-start', position);
};

/**
 * 描画継続
 */
const continueDrawing = (position: LogicalPosition) => {
  if (!isDrawing.value || !props.isEnabled) return;

  currentPath.value += ` L ${position.x} ${position.y}`;

  emit('drawing-move', position);
};

/**
 * 描画終了
 */
const endDrawing = () => {
  if (!isDrawing.value || !currentPath.value) return;

  const newStroke: DrawingStroke = {
    id: currentStrokeId.value,
    path: currentPath.value,
    color: currentStroke.value.color,
    width: currentStroke.value.width,
    linecap: currentStroke.value.linecap,
    linejoin: currentStroke.value.linejoin,
    opacity: currentStroke.value.opacity,
    timestamp: Date.now(),
  };

  strokes.value.push(newStroke);

  // 状態をリセット
  isDrawing.value = false;
  currentPath.value = '';
  currentStrokeId.value = '';

  emit('drawing-end', newStroke);
  emit('strokes-change', [...strokes.value]);

  // LocalStorageに保存
  saveToLocalStorage();
};

/**
 * 全ての描画をクリア
 */
const clearAll = () => {
  strokes.value = [];
  isDrawing.value = false;
  currentPath.value = '';
  currentStrokeId.value = '';

  emit('strokes-change', []);
  saveToLocalStorage();
};

/**
 * 特定のストロークを削除
 */
const removeStroke = (strokeId: string) => {
  const index = strokes.value.findIndex(s => s.id === strokeId);
  if (index > -1) {
    strokes.value.splice(index, 1);
    emit('strokes-change', [...strokes.value]);
    saveToLocalStorage();
  }
};

/**
 * 最後のストロークを取り消し
 */
const undo = () => {
  if (strokes.value.length > 0) {
    strokes.value.pop();
    emit('strokes-change', [...strokes.value]);
    saveToLocalStorage();
  }
};

/**
 * LocalStorageに保存
 */
const saveToLocalStorage = () => {
  try {
    const data = {
      strokes: strokes.value,
      timestamp: Date.now(),
      version: '2.0' // SVG版であることを示す
    };
    localStorage.setItem('drawing_svg_data', JSON.stringify(data));
    console.log('🎨 SVG描画データ保存完了');
  } catch (error) {
    console.error('❌ 描画データ保存エラー:', error);
  }
};

/**
 * LocalStorageから読み込み
 */
const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('drawing_svg_data');
    if (data) {
      const parsed = JSON.parse(data);

      if (parsed.version === '2.0' && Array.isArray(parsed.strokes)) {
        strokes.value = parsed.strokes;
        console.log('🎨 SVG描画データ読み込み完了:', strokes.value.length, 'ストローク');
      }
    }

    // 旧形式のCanvasデータがあれば変換フラグをチェック
    const conversionNeeded = localStorage.getItem('drawing_conversion_needed');
    if (conversionNeeded === 'true') {
      console.log('🔄 旧形式の描画データ変換が必要です（現在は未実装）');
      // TODO: Canvas描画データからSVGパスへの変換
    }
  } catch (error) {
    console.error('❌ 描画データ読み込みエラー:', error);
  }
};

/**
 * 描画データをエクスポート
 */
const exportDrawing = (): DrawingStroke[] => {
  return [...strokes.value];
};

/**
 * 描画データをインポート
 */
const importDrawing = (importedStrokes: DrawingStroke[]) => {
  strokes.value = [...importedStrokes];
  emit('strokes-change', [...strokes.value]);
  saveToLocalStorage();
};

// 初期化時にデータを読み込み
loadFromLocalStorage();

// 外部から呼び出し可能な関数をエクスポート
defineExpose({
  startDrawing,
  continueDrawing,
  endDrawing,
  clearAll,
  removeStroke,
  undo,
  exportDrawing,
  importDrawing,
  isDrawing: computed(() => isDrawing.value),
  strokeCount: computed(() => strokes.value.length),
});
</script>

<style scoped>
.drawing-svg {
  /* SVG描画レイヤー */
  pointer-events: none; /* マウスイベントは親に委譲 */
}

.drawing-path {
  vector-effect: non-scaling-stroke; /* ストローク幅をスケールに依存させない */
  transition: opacity 0.2s ease;
}

.current-stroke {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
}

/* 描画中のアニメーション効果 */
@keyframes drawingPulse {
  0%, 100% {
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.8));
  }
}

.current-stroke {
  animation: drawingPulse 1s ease-in-out infinite;
}
</style>
