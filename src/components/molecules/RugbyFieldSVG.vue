<template>
  <g class="rugby-field">
    <!-- フィールド背景 -->
    <rect
      :x="fieldBounds.minX"
      :y="fieldBounds.minY"
      :width="fieldBounds.maxX - fieldBounds.minX"
      :height="fieldBounds.maxY - fieldBounds.minY"
      class="field-background"
    />

    <!-- フィールドライン（条件付き表示） -->
    <g v-if="showLines" class="field-lines">
      <!-- 外枠 -->
      <rect
        :x="fieldBounds.minX"
        :y="fieldBounds.minY"
        :width="fieldBounds.maxX - fieldBounds.minX"
        :height="fieldBounds.maxY - fieldBounds.minY"
        class="field-border"
      />

      <!-- ゴールポスト（上側） -->
      <g class="goal-posts">
        <!-- 上側ゴールポスト -->
        <line x1="-12" y1="35" x2="-12" y2="50" class="goal-post" />
        <line x1="12" y1="35" x2="12" y2="50" class="goal-post" />
        <line x1="-12" y1="42.5" x2="12" y2="42.5" class="goal-post" />

        <!-- 下側ゴールポスト -->
        <line x1="-12" y1="-35" x2="-12" y2="-50" class="goal-post" />
        <line x1="12" y1="-35" x2="12" y2="-50" class="goal-post" />
        <line x1="-12" y1="-42.5" x2="12" y2="-42.5" class="goal-post" />
      </g>

      <!-- インゴールライン -->
      <line x1="-60" y1="35" x2="60" y2="35" class="try-line" />
      <line x1="-60" y1="-35" x2="60" y2="-35" class="try-line" />

      <!-- 22mライン -->
      <line x1="-60" y1="13" x2="60" y2="13" class="twenty-two-line" />
      <line x1="-60" y1="-13" x2="60" y2="-13" class="twenty-two-line" />

      <!-- ハーフライン -->
      <line x1="-60" y1="0" x2="60" y2="0" class="halfway-line" />

      <!-- 10mライン -->
      <line x1="-60" y1="10" x2="60" y2="10" class="ten-meter-line" />
      <line x1="-60" y1="-10" x2="60" y2="-10" class="ten-meter-line" />

      <!-- 5mライン（点線） -->
      <line x1="-60" y1="30" x2="60" y2="30" class="five-meter-line" />
      <line x1="-60" y1="-30" x2="60" y2="-30" class="five-meter-line" />

      <!-- 15mライン（短線） -->
      <g class="fifteen-meter-lines">
        <!-- 上側 -->
        <line x1="-45" y1="35" x2="-45" y2="30" class="fifteen-meter-line" />
        <line x1="-48" y1="30" x2="-42" y2="30" class="fifteen-meter-line" />
        <line x1="45" y1="35" x2="45" y2="30" class="fifteen-meter-line" />
        <line x1="42" y1="30" x2="48" y2="30" class="fifteen-meter-line" />

        <!-- 下側 -->
        <line x1="-45" y1="-35" x2="-45" y2="-30" class="fifteen-meter-line" />
        <line x1="-48" y1="-30" x2="-42" y2="-30" class="fifteen-meter-line" />
        <line x1="45" y1="-35" x2="45" y2="-30" class="fifteen-meter-line" />
        <line x1="42" y1="-30" x2="48" y2="-30" class="fifteen-meter-line" />
      </g>

      <!-- サイドライン（5m、15m点線） -->
      <g class="sideline-marks">
        <!-- 左サイド -->
        <line x1="-55" y1="-30" x2="-55" y2="30" class="sideline-five" />
        <line x1="-45" y1="-30" x2="-45" y2="30" class="sideline-fifteen" />

        <!-- 右サイド -->
        <line x1="55" y1="-30" x2="55" y2="30" class="sideline-five" />
        <line x1="45" y1="-30" x2="45" y2="30" class="sideline-fifteen" />
      </g>
    </g>

    <!-- フィールド境界ハイライト（開発用） -->
    <rect
      v-if="showBoundaryHighlight"
      :x="fieldBounds.minX"
      :y="fieldBounds.minY"
      :width="fieldBounds.maxX - fieldBounds.minX"
      :height="fieldBounds.maxY - fieldBounds.minY"
      class="boundary-highlight"
    />
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFieldBoundary } from '@/composables/useFieldBoundary';

defineOptions({
  name: 'RugbyFieldSVG'
});

interface Props {
  showLines?: boolean;
  showBoundaryHighlight?: boolean;
  includeInGoal?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showLines: true,
  showBoundaryHighlight: false,
  includeInGoal: true,
});

// フィールド境界管理
const { getFieldBounds } = useFieldBoundary();

// フィールド境界の計算
const fieldBounds = computed(() => {
  return getFieldBounds(props.includeInGoal);
});
</script>

<style scoped>
.rugby-field {
  /* SVGグループのスタイル */
}

.field-background {
  fill: #0CD30C;
  stroke: none;
}

.field-border {
  fill: none;
  stroke: #ffffff;
  stroke-width: 2;
}

.field-lines {
  /* フィールドライングループ */
}

.goal-post {
  stroke: #ffffff;
  stroke-width: 3;
  stroke-linecap: round;
}

.try-line {
  stroke: #ffffff;
  stroke-width: 2;
}

.twenty-two-line {
  stroke: #ffffff;
  stroke-width: 1.5;
}

.halfway-line {
  stroke: #ffffff;
  stroke-width: 2;
}

.ten-meter-line {
  stroke: #ffffff;
  stroke-width: 1;
  stroke-dasharray: 5,5;
}

.five-meter-line {
  stroke: #ffffff;
  stroke-width: 1;
  stroke-dasharray: 3,3;
}

.fifteen-meter-line {
  stroke: #ffffff;
  stroke-width: 1.5;
}

.sideline-five {
  stroke: #ffffff;
  stroke-width: 1;
  stroke-dasharray: 2,4;
}

.sideline-fifteen {
  stroke: #ffffff;
  stroke-width: 1;
  stroke-dasharray: 4,4;
}

.boundary-highlight {
  fill: rgba(255, 0, 0, 0.1);
  stroke: #ff0000;
  stroke-width: 1;
  stroke-dasharray: 5,5;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .goal-post {
    stroke-width: 2;
  }

  .try-line {
    stroke-width: 1.5;
  }

  .twenty-two-line {
    stroke-width: 1;
  }

  .halfway-line {
    stroke-width: 1.5;
  }
}
</style>
