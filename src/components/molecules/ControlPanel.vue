<template>
  <div class="control-panel">
    <div class="panel-section">
      <h3>設定</h3>
      <div class="settings-group">
        <label>
          <input
            type="checkbox"
            :checked="boardSettings.showLines"
            @change="$emit('update-board-settings', 'showLines', !boardSettings.showLines)"
          >
          白線表示
        </label>
        <label>
          <input
            type="checkbox"
            :checked="boardSettings.showNumbers"
            @change="$emit('update-board-settings', 'showNumbers', !boardSettings.showNumbers)"
          >
          背番号表示
        </label>
      </div>
    </div>

    <div class="panel-section">
      <h3>描画</h3>
      <div class="drawing-controls">
        <button
          class="btn btn-clear"
          @click="$emit('clear-drawing')"
        >
          描画クリア
        </button>
      </div>
    </div>

    <div class="panel-section">
      <h3>マーカー</h3>
      <div class="marker-controls">
        <button
          class="btn btn-add"
          @click="$emit('add-marker')"
        >
          マーカー追加
        </button>
        <button
          class="btn btn-remove"
          @click="$emit('remove-marker')"
        >
          マーカー削除
        </button>
      </div>
    </div>

    <div class="panel-section">
      <h3>プレイヤー</h3>
      <div class="player-controls">
        <button
          class="btn btn-clear"
          @click="$emit('clear-players')"
        >
          プレイヤークリア
        </button>
      </div>
    </div>

    <div class="panel-section">
      <h3>ポジション</h3>
      <div class="position-controls">
        <button
          class="btn btn-save"
          :disabled="isLoading"
          @click="$emit('save-position')"
        >
          ポジション保存
        </button>
        <div
          v-if="positions.length > 0"
          class="position-list"
        >
          <div
            v-for="position in positions"
            :key="position.name"
            class="position-item"
          >
            <button
              class="btn btn-apply"
              :class="{ active: selectedPosition === position.name }"
              @click="$emit('apply-position', position.name)"
            >
              {{ position.name }}
            </button>
            <button
              class="btn btn-delete"
              :disabled="isLoading"
              @click="$emit('delete-position', position.name)"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <button
        class="btn btn-logout"
        @click="$emit('logout')"
      >
        ログアウト
      </button>
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
}

defineProps<Props>();

defineEmits<{
  'update-board-settings': [setting: string, value: boolean];
  'update-line-settings': [settings: Partial<LineSettings>];
  'add-marker': [];
  'remove-marker': [];
  'clear-players': [];
  'clear-drawing': [];
  'save-position': [];
  'apply-position': [positionName: string];
  'delete-position': [positionName: string];
  'logout': [];
}>();
</script>

<style scoped>
.control-panel {
  width: 300px;
  padding: 20px;
  background: white;
  border-left: 1px solid #ddd;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.panel-section:last-child {
  border-bottom: none;
}

h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.drawing-controls,
.marker-controls,
.player-controls,
.position-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #f5f5f5;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-clear {
  background: #ff5722;
  color: white;
  border-color: #ff5722;
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

.btn-save {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.btn-apply {
  background: #9c27b0;
  color: white;
  border-color: #9c27b0;
}

.btn-apply.active {
  background: #673ab7;
  border-color: #673ab7;
}

.btn-delete {
  background: #f44336;
  color: white;
  border-color: #f44336;
  font-size: 12px;
  padding: 4px 8px;
}

.btn-logout {
  background: #607d8b;
  color: white;
  border-color: #607d8b;
  width: 100%;
}

.position-list {
  max-height: 200px;
  overflow-y: auto;
}

.position-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.position-item .btn-apply {
  flex: 1;
  font-size: 14px;
}
</style>
