<template>
  <div class="rugby-board">
    <div class="board-container" @click="handleBoardClick">
      <div class="canvas-container">
        <RugbyField
          :show-lines="boardSettings.showLines"
          @draw-start="handleDrawStart"
          @draw-move="handleDrawMove"
          @draw-end="handleDrawEnd"
        />
        <DrawingCanvas
          ref="drawingCanvasRef"
          :line-settings="lineSettings"
        />
      </div>

      <!-- プレイヤーピースの表示 -->
      <PlayerPiece
        v-for="player in allPlayersWithSelection"
        :id="player.id"
        :key="player.id"
        :number="player.number"
        :team="player.team"
        :x="player.x"
        :y="player.y"
        :show-number="boardSettings.showNumbers"
        :is-selected="player.isSelected && !player.isMultiSelected"
        :is-multi-selected="player.isMultiSelected"
        :selection-order="player.selectionOrder"
        @mousedown="handlePlayerMouseDown"
        @mouseup="handlePlayerMouseUp"
        @click="handlePlayerClick"
      />

      <!-- マーカーの表示 -->
      <BoardMarker
        v-for="marker in markers"
        :key="marker.index"
        :x="marker.x"
        :y="marker.y"
        :index="marker.index"
        @mousedown="handleMarkerMouseDown"
        @mouseup="handleMarkerMouseUp"
      />
    </div>

    <ControlPanel
      :board-settings="boardSettings"
      :line-settings="lineSettings"
      :positions="positions"
      :selected-position="selectedPosition"
      :is-loading="isLoading"
      @update-board-settings="handleBoardSettingsUpdate"
      @update-line-settings="handleLineSettingsUpdate"
      @add-marker="handleAddMarker"
      @remove-marker="handleRemoveMarker"
      @clear-players="handleClearPlayers"
      @clear-drawing="handleClearDrawing"
      @save-position="handleSavePosition"
      @apply-position="handleApplyPosition"
      @delete-position="handleDeletePosition"
      @logout="handleLogout"
    />

    <PositionModal
      v-if="showPositionModal"
      :position-name="positionName"
      @save="handlePositionSave"
      @cancel="handlePositionCancel"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'RugbyBoard'
});

import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import { useBoard } from '@/composables/useBoard';
import { useMultiSelect } from '@/composables/useMultiSelect';
import { useAuth } from '@/composables/useAuth';
import { useUserStore } from '@/stores/user';
import { useDragAndDrop } from '@/composables/useDragAndDrop';
import { useDrawing } from '@/composables/useDrawing';

// Components
import PlayerPiece from '@/components/atoms/PlayerPiece.vue';
import BoardMarker from '@/components/atoms/BoardMarker.vue';
import RugbyField from '@/components/molecules/RugbyField.vue';
import DrawingCanvas from '@/components/molecules/DrawingCanvas.vue';
import ControlPanel from '@/components/molecules/ControlPanel.vue';
import PositionModal from '@/components/molecules/PositionModal.vue';

// Composables
const {
  players,
  playersWithSelection,
  markers,
  positions,
  selectedPosition,
  boardSettings,
  lineSettings,
  isLoading,
  selectedPlayers,
  selectedCount,
  isMultiSelected,
  handlePlayerClick,
  clearSelection,
  startMultiDrag,
  movePlayer,
  clearPlayers,
  addMarker,
  removeMarker,
  savePosition,
  loadPositions,
  deletePosition,
  applyPosition,
  toggleBoardSetting,
  updateLineSettings
} = useBoard();

const { logout } = useAuth();
const userStore = useUserStore();

const {
  startDrag,
  endDrag,
  isDragging,
  draggedElement
} = useDragAndDrop();

const {
  startDrawing,
  draw,
  endDrawing,
  clearDrawing
} = useDrawing();

// Refs
const drawingCanvasRef = ref<InstanceType<typeof DrawingCanvas>>();
const showPositionModal = ref(false);
const positionName = ref('');

// Computed
const allPlayers = computed(() => {
  return [...players.value[0], ...players.value[1]];
});

const allPlayersWithSelection = computed(() => {
  const flatPlayers = [...playersWithSelection.value[0], ...playersWithSelection.value[1]];
  return flatPlayers.map(player => ({
    ...player,
    isMultiSelected: selectedCount.value > 1 && player.isSelected
  }));
});

// Event Handlers
const handlePlayerMouseDown = (event: MouseEvent, playerId: string) => {
  startMultiDrag(playerId);
  startDrag(event, playerId, 'player');
};

const handlePlayerMouseUp = (event: MouseEvent) => {
  endDrag(event);
};

const handleMarkerMouseDown = (event: MouseEvent, markerId: number) => {
  startDrag(event, markerId.toString(), 'marker');
};

const handleMarkerMouseUp = (event: MouseEvent) => {
  endDrag(event);
};

const handleDrawStart = (event: MouseEvent) => {
  const context = drawingCanvasRef.value?.getContext();
  if (context) {
    startDrawing(event, context);
  }
};

const handleDrawMove = (event: MouseEvent) => {
  draw(event);
};

const handleDrawEnd = (event: MouseEvent) => {
  endDrawing(event);
};

const handleBoardSettingsUpdate = (setting: string) => {
  toggleBoardSetting(setting as keyof typeof boardSettings.value);
};

const handleLineSettingsUpdate = (settings: Partial<typeof lineSettings.value>) => {
  updateLineSettings(settings);
};

const handleAddMarker = () => {
  // デフォルト位置にマーカーを追加
  addMarker(300, 300);
};

const handleRemoveMarker = () => {
  removeMarker();
};

const handleClearPlayers = () => {
  clearPlayers();
};

const handleClearDrawing = () => {
  clearDrawing();
  drawingCanvasRef.value?.clear();
};

const handleSavePosition = () => {
  showPositionModal.value = true;
};

const handlePositionSave = async (name: string) => {
  if (userStore.currentUser?.uid) {
    try {
      await savePosition(userStore.currentUser.uid, name);
      showPositionModal.value = false;
      positionName.value = '';
    } catch (error) {
      console.error('位置の保存に失敗しました:', error);
    }
  }
};

const handlePositionCancel = () => {
  showPositionModal.value = false;
  positionName.value = '';
};

const handleApplyPosition = (positionName: string) => {
  applyPosition(positionName);
};

const handleDeletePosition = async (positionName: string) => {
  if (userStore.currentUser?.uid) {
    try {
      await deletePosition(userStore.currentUser.uid, positionName);
    } catch (error) {
      console.error('位置の削除に失敗しました:', error);
    }
  }
};

const handleLogout = async () => {
  try {
    await logout();
    userStore.logout();
  } catch (error) {
    console.error('ログアウトに失敗しました:', error);
  }
};

// Mouse move handler for dragging
const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value && draggedElement.value) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (draggedElement.value.type === 'player') {
      movePlayer(draggedElement.value.id, x, y);
    }
  }
};

// Board click handler - 空白クリックで選択解除
const handleBoardClick = (event: MouseEvent) => {
  // ボードの背景がクリックされた場合のみ選択解除
  if (event.target === event.currentTarget) {
    clearSelection();
  }
};

// 直接useMultiSelectを使用してonMountedを実行させる
const multiSelectDebug = useMultiSelect();

// 最もシンプルなデバッグ - RugbyBoardのマウント確認
console.log('RugbyBoard script setup executed');

// Lifecycle
onMounted(async () => {
  console.log('RugbyBoard onMounted called');

  if (userStore.currentUser?.uid) {
    await loadPositions(userStore.currentUser.uid);
  }

  // マウスムーブイベントリスナーを追加
  document.addEventListener('mousemove', handleMouseMove);

  // 直接windowにキーイベントリスナーを追加（デバッグ用）
  const debugKeyDown = (event: KeyboardEvent) => {
    console.log('🔑 Direct window keydown:', {
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      target: event.target,
      timestamp: Date.now()
    });
  };

  const debugKeyUp = (event: KeyboardEvent) => {
    console.log('🔑 Direct window keyup:', {
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey
    });
  };

  window.addEventListener('keydown', debugKeyDown, true); // capture=true
  window.addEventListener('keyup', debugKeyUp, true);

  console.log('✅ RugbyBoard: Direct key listeners added to window');

  // クリーンアップ用に保存
  (window as any)._rugbyBoardKeyListeners = { debugKeyDown, debugKeyUp };
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);

  // 直接追加したキーリスナーをクリーンアップ
  const listeners = (window as any)._rugbyBoardKeyListeners;
  if (listeners) {
    window.removeEventListener('keydown', listeners.debugKeyDown, true);
    window.removeEventListener('keyup', listeners.debugKeyUp, true);
    delete (window as any)._rugbyBoardKeyListeners;
    console.log('🧹 RugbyBoard: Direct key listeners removed');
  }
});
</script>

<style scoped>
.rugby-board {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.board-container {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.canvas-container {
  position: relative;
  width: 660px;
  height: 580px;
  margin: 20px;
  border: 2px solid #333;
  border-radius: 8px;
  overflow: hidden;
}
</style>
