<template>
  <div class="control-panel">
    <!-- 上部：設定とクイックアクション -->
    <div class="top-section">
      <div class="settings-row">
        <div class="toggle-group">
          <label class="toggle-item">
            <input
              type="checkbox"
              :checked="boardSettings.showLines"
              @change="$emit('update-board-settings', 'showLines', !boardSettings.showLines)"
            >
            <span class="toggle-label">白線</span>
          </label>
          <label class="toggle-item">
            <input
              type="checkbox"
              :checked="boardSettings.showNumbers"
              @change="$emit('update-board-settings', 'showNumbers', !boardSettings.showNumbers)"
            >
            <span class="toggle-label">背番号</span>
          </label>
        </div>
      </div>
    </div>

    <!-- 選択方式切り替えセクション -->
    <div class="selection-section">
      <h4 class="section-title">
        選択方式
      </h4>
      <div class="mode-toggle">
        <button
          :class="['mode-btn', { active: !isRectangleMode }]"
          @click="handleNormalModeClick"
        >
          🖱️ 通常選択
        </button>
        <button
          :class="['mode-btn', { active: isRectangleMode }]"
          @click="handleRectangleModeClick"
        >
          ⬛ 矩形選択
        </button>
      </div>

      <!-- モード説明 -->
      <div class="mode-description">
        <p v-if="!isRectangleMode">
          Ctrl/Cmd+クリックで複数選択
        </p>
        <p v-else>
          ドラッグで矩形選択（描画無効）
        </p>
      </div>
    </div>

    <!-- 描画設定：アイコンベース -->
    <div class="drawing-section">
      <h4 class="section-title">
        描画設定
      </h4>

      <!-- 色選択 -->
      <div class="color-palette">
        <button
          v-for="color in colorOptions"
          :key="color.value"
          :class="['color-btn', { active: lineSettings.color === color.value }]"
          :style="{ backgroundColor: color.bg }"
          :title="color.name"
          @click="$emit('update-line-settings', { color: color.value })"
        >
          <span
            v-if="color.icon"
            class="color-icon"
          >{{ color.icon }}</span>
        </button>
      </div>

      <!-- 太さ選択 -->
      <div class="thickness-selector">
        <button
          v-for="thickness in thicknessOptions"
          :key="thickness.value"
          :class="['thickness-btn', { active: lineSettings.width === thickness.value }]"
          :title="thickness.name"
          @click="$emit('update-line-settings', { width: thickness.value })"
        >
          <div
            class="thickness-preview"
            :style="{
              width: thickness.preview + 'px',
              height: thickness.preview + 'px',
              backgroundColor: '#333'
            }"
          />
        </button>
      </div>

      <!-- 描画アクション -->
      <div class="drawing-actions">
        <button
          class="btn btn-clear-drawing"
          title="描画クリア"
          @click="$emit('clear-drawing')"
        >
          🧹 描画クリア
        </button>
      </div>
    </div>

    <!-- アクションボタン：2カラムレイアウト -->
    <div class="actions-section">
      <div class="action-group">
        <h4 class="section-title">
          マーカー
        </h4>
        <div class="button-row">
          <button
            class="btn btn-add"
            @click="$emit('add-marker')"
          >
            <span class="btn-icon">📍</span>
            <span class="btn-text">追加</span>
          </button>
          <button
            class="btn btn-remove"
            @click="$emit('remove-marker')"
          >
            <span class="btn-icon">🗑️</span>
            <span class="btn-text">削除</span>
          </button>
        </div>
      </div>

      <div class="action-group">
        <h4 class="section-title">
          プレイヤー
        </h4>
        <button
          class="btn btn-clear full-width"
          @click="$emit('clear-players')"
        >
          <span class="btn-icon">👥</span>
          <span class="btn-text">クリア</span>
        </button>
      </div>
    </div>

    <!-- ポジション管理 -->
    <div class="position-section">
      <div class="position-header">
        <h4 class="section-title">
          ポジション
        </h4>
        <button
          class="btn btn-save compact"
          :disabled="isLoading"
          @click="$emit('save-position')"
        >
          💾 保存
        </button>
      </div>

      <div
        v-if="positions.length > 0"
        class="position-grid"
      >
        <div
          v-for="position in positions"
          :key="position.name"
          class="position-card"
          :class="{ active: selectedPosition === position.name }"
        >
          <button
            class="position-name"
            @click="$emit('apply-position', position.name)"
          >
            {{ position.name }}
          </button>
          <button
            class="position-delete"
            :disabled="isLoading"
            title="削除"
            @click="$emit('delete-position', position.name)"
          >
            ❌
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ControlPanel'
});

import type { BoardSettings, LineSettings, Position } from '@/types/rugby';

interface Props {
  boardSettings: BoardSettings;
  lineSettings: LineSettings;
  positions: Position[];
  selectedPosition: string;
  isLoading: boolean;
  isRectangleMode: boolean;
}

const props = defineProps<Props>();
console.log('📥 ControlPanel: Props received:', {
  isRectangleModeReceived: 'isRectangleMode' in props,
  isRectangleModeValue: props.isRectangleMode
});

// デバッグ用：propsの変更を監視
import { watch } from 'vue';
watch(() => props.isRectangleMode, (newValue, oldValue) => {
  console.log('📝 ControlPanel: isRectangleMode changed:', { oldValue, newValue });
}, { immediate: true });

const emits = defineEmits<{
  'update-board-settings': [setting: string, value: boolean];
  'update-line-settings': [settings: Partial<LineSettings>];
  'add-marker': [];
  'remove-marker': [];
  'clear-players': [];
  'clear-drawing': [];
  'save-position': [];
  'apply-position': [positionName: string];
  'delete-position': [positionName: string];
  'set-selection-mode': [mode: 'normal' | 'rectangle'];
}>();

// 色オプション
const colorOptions = [
  { value: 'white', name: '白', bg: '#ffffff', icon: '' },
  { value: 'black', name: '黒', bg: '#000000', icon: '' },
  { value: 'red', name: '赤', bg: '#ff4444', icon: '' },
  { value: 'blue', name: '青', bg: '#4444ff', icon: '' },
  { value: 'yellow', name: '黄', bg: '#ffff44', icon: '' },
  { value: 'transparent', name: '消しゴム', bg: '#f0f0f0', icon: '🧽' }
];

// 太さオプション
const thicknessOptions = [
  { value: 2, name: '細', preview: 2 },
  { value: 4, name: '中', preview: 4 },
  { value: 6, name: '太', preview: 6 }
];

// 選択モード切り替えハンドラー
const handleNormalModeClick = () => {
  console.log('🖱️ ControlPanel: Normal mode button clicked');
  console.log('📤 ControlPanel: About to emit set-selection-mode with normal');
  emits('set-selection-mode', 'normal');
  console.log('✅ ControlPanel: Emitted set-selection-mode with normal');
};

const handleRectangleModeClick = () => {
  console.log('⬛ ControlPanel: Rectangle mode button clicked');
  console.log('📤 ControlPanel: About to emit set-selection-mode with rectangle');
  emits('set-selection-mode', 'rectangle');
  console.log('✅ ControlPanel: Emitted set-selection-mode with rectangle');
};
</script>

<style scoped>
.control-panel {
  width: 320px;
  padding: 16px;
  background: white;
  border-left: 1px solid #ddd;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 上部設定 */
.top-section {
  flex-shrink: 0;
}

.settings-row {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.toggle-group {
  display: flex;
  gap: 16px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.toggle-label {
  color: #333;
  font-weight: 500;
}

/* 選択方式切り替えセクション */
.selection-section {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.mode-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.mode-btn.active {
  border-color: #2196f3;
  background: #e3f2fd;
  color: #1976d2;
  font-weight: bold;
}

.mode-description {
  font-size: 11px;
  color: #666;
  text-align: center;
  font-style: italic;
}

.btn-clear-drawing {
  padding: 8px 12px;
  background: #ff5722;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-clear-drawing:hover {
  background: #e64a19;
  transform: scale(1.05);
}

/* 描画設定 */
.drawing-section {
  flex-shrink: 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.color-palette {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.color-btn {
  width: 32px;
  height: 32px;
  border: 2px solid #ddd;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.color-btn.active {
  border-color: #2196f3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
  transform: scale(1.1);
}

.color-btn:hover {
  transform: scale(1.05);
}

.thickness-selector {
  display: flex;
  gap: 8px;
}

.thickness-btn {
  width: 40px;
  height: 32px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.thickness-btn.active {
  border-color: #2196f3;
  background: #e3f2fd;
}

.thickness-preview {
  border-radius: 50%;
}

.drawing-actions {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

/* アクションセクション */
.actions-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  flex-shrink: 0;
}

.action-group {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.button-row {
  display: flex;
  gap: 8px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  flex: 1;
}

.btn:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-weight: 500;
}

.btn-add {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.btn-remove {
  background: #f44336;
  color: white;
  border-color: #f44336;
}

.btn-clear {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
}

.btn-save {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.full-width {
  width: 100%;
  justify-content: center;
}

.compact {
  padding: 6px 12px;
  font-size: 12px;
}

/* ポジション管理 */
.position-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.position-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
}

.position-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.2s;
}

.position-card.active {
  border-color: #9c27b0;
  background: #f3e5f5;
}

.position-name {
  flex: 1;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.position-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.position-delete:hover {
  opacity: 1;
}

/* スクロールバーのスタイリング */
.position-grid::-webkit-scrollbar {
  width: 4px;
}

.position-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.position-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.position-grid::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
