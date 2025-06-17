<template>
  <div class="figma-like-rugby-board">
    <!-- ヘッダー -->
    <header class="board-header">
      <h1 class="board-title">Rugby Board</h1>
      <div class="header-controls">
        <!-- ビューポートコントロール -->
        <div class="viewport-controls">
          <button @click="resetViewport" class="control-button" title="フィールド全体を表示">
            🏠
          </button>
          <span class="zoom-indicator">{{ zoomPercentage }}%</span>
          <button @click="zoomIn" class="control-button" title="ズームイン">
            ➕
          </button>
          <button @click="zoomOut" class="control-button" title="ズームアウト">
            ➖
          </button>
        </div>

        <!-- ユーザーメニュー -->
        <UserMenu
          :user-email="authStore.loginUser?.email"
          :user-name="authStore.loginUser?.displayName"
          @logout="logout"
          @profile="handleProfile"
        />
      </div>
    </header>

    <div class="board-container">
      <!-- メインキャンバスエリア -->
      <div
        ref="canvasContainer"
        class="canvas-area"
        :class="{
          'pan-cursor': isPanning,
          'selection-cursor': isRectangleSelectionMode,
        }"
        @wheel="handleWheelEvent"
        @mousedown="handleCanvasMouseDown"
        @mousemove="handleCanvasMouseMove"
        @mouseup="handleCanvasMouseUp"
        @contextmenu.prevent
      >
        <!-- SVGキャンバス -->
        <svg
          class="infinite-canvas"
          :viewBox="viewBoxString"
          @wheel.prevent="handleWheelEvent"
          @mousedown="handleSVGMouseDown"
          @mousemove="handleSVGMouseMove"
          @mouseup="handleSVGMouseUp"
        >
          <!-- フィールドレンダリング -->
          <RugbyFieldSVG
            :show-lines="boardSettings.showLines"
            :show-boundary-highlight="false"
            :include-in-goal="true"
          />

          <!-- 描画レイヤー（フィールドとプレイヤーの間） -->
          <DrawingSVG
            ref="drawingSVGRef"
            :line-settings="lineSettings"
            :scale="viewport.scale"
            :is-enabled="!isRectangleSelectionMode"
            @drawing-start="handleDrawingStart"
            @drawing-move="handleDrawingMove"
            @drawing-end="handleDrawingEnd"
            @strokes-change="handleStrokesChange"
          />

          <!-- プレイヤーピースをSVG座標系で配置 -->
          <PlayerPieceSVG
            v-for="player in allPlayers"
            :key="player.id"
            :id="player.id"
            :number="player.number"
            :team="player.team"
            :logical-x="player.logicalX"
            :logical-y="player.logicalY"
            :scale="viewport.scale"
            :show-number="boardSettings.showNumbers"
            :is-selected="player.isSelected && !player.isMultiSelected"
            :is-multi-selected="player.isMultiSelected"
            :selection-order="player.selectionOrder"
            :is-dragging="isDragging && draggedPlayerId === player.id"
            @mousedown="handlePlayerMouseDown"
            @mouseup="handlePlayerMouseUp"
            @click="handlePlayerClick"
          />

          <!-- 矩形選択ボックス -->
          <rect
            v-if="rectangleSelection.isActive"
            :x="selectionRectangle.x"
            :y="selectionRectangle.y"
            :width="selectionRectangle.width"
            :height="selectionRectangle.height"
            class="selection-rectangle"
          />
        </svg>

        <!-- ナビゲーションヒント -->
        <div class="navigation-hints" v-if="showNavigationHints">
          <div class="hint">
            <span class="hint-key">Ctrl + ホイール</span>
            <span class="hint-action">ズーム</span>
          </div>
          <div class="hint">
            <span class="hint-key">ホイール</span>
            <span class="hint-action">パン</span>
          </div>
          <div class="hint">
            <span class="hint-key">ドラッグ</span>
            <span class="hint-action">パン（空白エリア）</span>
          </div>
          <div class="hint">
            <span class="hint-key">Shift + ドラッグ</span>
            <span class="hint-action">描画</span>
          </div>
          <div class="hint">
            <span class="hint-key">Ctrl + クリック</span>
            <span class="hint-action">複数選択</span>
          </div>
        </div>
      </div>

      <!-- 固定UIパネル -->
      <ControlPanel
        class="control-panel-fixed"
        :board-settings="boardSettings"
        :line-settings="lineSettings"
        :positions="positions"
        :selected-position="selectedPosition"
        :is-loading="isLoading"
        :is-rectangle-mode="isRectangleSelectionMode"
        @update-board-settings="handleBoardSettingsUpdate"
        @update-line-settings="handleLineSettingsUpdate"
        @add-marker="handleAddMarker"
        @remove-marker="handleRemoveMarker"
        @clear-players="handleClearPlayers"
        @clear-drawing="handleClearDrawing"
        @save-position="handleSavePosition"
        @apply-position="handleApplyPosition"
        @delete-position="handleDeletePosition"
        @set-selection-mode="handleSetSelectionMode"
      />
    </div>

    <!-- ポジション保存モーダル -->
    <PositionModal
      v-if="showPositionModal"
      :position-name="positionName"
      @save="handlePositionSave"
      @cancel="handlePositionCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useViewport, screenToLogical, logicalToScreen } from '@/composables/useViewport';
import { useFieldBoundary } from '@/composables/useFieldBoundary';
import { defaultCoordinateTransform, getPlayerLogicalPosition } from '@/utils/coordinateTransform';
import { useAuthStore } from '@/stores/auth';

// Components
import RugbyFieldSVG from '@/components/molecules/RugbyFieldSVG.vue';
import PlayerPieceSVG from '@/components/atoms/PlayerPieceSVG.vue';
import ControlPanel from '@/components/molecules/ControlPanel.vue';
import PositionModal from '@/components/molecules/PositionModal.vue';
import UserMenu from '@/components/molecules/UserMenu.vue';
import DrawingSVG from '@/components/molecules/DrawingSVG.vue';

defineOptions({
  name: 'FigmaLikeRugbyBoard'
});

// ストア
const authStore = useAuthStore();

// コンポーザブル
const {
  viewport,
  handleWheel,
  startPan,
  setZoom,
  resetViewport: resetVp,
  focusOn,
  viewBoxString
} = useViewport();

const {
  clampToBounds,
  isWithinBounds,
  getInitialPlayerPosition,
  getFieldBounds
} = useFieldBoundary();

// Refs
const canvasContainer = ref<HTMLElement>();
const showNavigationHints = ref(true);
const showPositionModal = ref(false);
const positionName = ref('');
const drawingSVGRef = ref<InstanceType<typeof DrawingSVG>>();

// 状態管理
const isDragging = ref(false);
const draggedPlayerId = ref<string | null>(null);
const isPanning = ref(false);
const isRectangleSelectionMode = ref(false);
const isLoading = ref(false);
const isDrawing = ref(false);

// プレイヤーデータ
const players = ref<any[][]>([
  // チーム1（15人）
  Array.from({ length: 15 }, (_, i) => ({
    id: `team0_${i}`,
    number: i + 1,
    team: 'my-team',
    ...getInitialPlayerPosition('home', i),
    logicalX: getInitialPlayerPosition('home', i).x,
    logicalY: getInitialPlayerPosition('home', i).y,
    isSelected: false,
    isMultiSelected: false,
    selectionOrder: 0,
  })),
  // チーム2（15人）
  Array.from({ length: 15 }, (_, i) => ({
    id: `team1_${i}`,
    number: i + 1,
    team: 'opponent',
    ...getInitialPlayerPosition('away', i),
    logicalX: getInitialPlayerPosition('away', i).x,
    logicalY: getInitialPlayerPosition('away', i).y,
    isSelected: false,
    isMultiSelected: false,
    selectionOrder: 0,
  })),
]);

// 選択状態管理
const selectedPlayers = ref<string[]>([]);
const selectionOrder = ref(0);

// 矩形選択状態
const rectangleSelection = ref({
  isActive: false,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
});

// 設定
const boardSettings = ref({
  showLines: true,
  showNumbers: true,
});

const lineSettings = ref({
  color: 'white',
  width: 4,
});

const positions = ref<any[]>([]);
const selectedPosition = ref('');

// 描画ストローク管理
const drawingStrokes = ref<any[]>([]);

// 計算されたプロパティ
const allPlayers = computed(() => {
  return [...players.value[0], ...players.value[1]];
});

const zoomPercentage = computed(() => {
  return Math.round(viewport.value.scale * 100);
});

const selectionRectangle = computed(() => {
  const { startX, startY, endX, endY } = rectangleSelection.value;
  return {
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
  };
});

// ホイールイベントハンドラー（containerElementを含む）
const handleWheelEvent = (event: WheelEvent) => {
  const container = canvasContainer.value;
  if (container) {
    handleWheel(event, container);
  }
};

// イベントハンドラー
const handleCanvasMouseDown = (event: MouseEvent) => {
  if (event.button === 0) { // 左クリック
    if (isRectangleSelectionMode.value) {
      startRectangleSelection(event);
    } else {
      startPan(event);
      isPanning.value = true;
    }
  }
};

const handleCanvasMouseMove = (event: MouseEvent) => {
  if (rectangleSelection.value.isActive) {
    updateRectangleSelection(event);
  }
};

const handleCanvasMouseUp = (event: MouseEvent) => {
  if (rectangleSelection.value.isActive) {
    endRectangleSelection();
  }
  isPanning.value = false;
};

const handlePlayerMouseDown = (event: MouseEvent, playerId: string) => {
  event.stopPropagation();

  if (!isRectangleSelectionMode.value) {
    isDragging.value = true;
    draggedPlayerId.value = playerId;
    startPlayerDrag(playerId, event);
  }
};

const handlePlayerMouseUp = (event: MouseEvent, playerId: string) => {
  event.stopPropagation();
  isDragging.value = false;
  draggedPlayerId.value = null;
};

const handlePlayerClick = (event: MouseEvent, playerId: string, isMultiSelect: boolean) => {
  event.stopPropagation();

  if (isMultiSelect) {
    togglePlayerSelection(playerId);
  } else {
    selectPlayer(playerId);
  }
};

// プレイヤー選択管理
const selectPlayer = (playerId: string) => {
  clearSelection();
  selectedPlayers.value = [playerId];
  updatePlayerSelectionState();
};

const togglePlayerSelection = (playerId: string) => {
  const index = selectedPlayers.value.indexOf(playerId);
  if (index > -1) {
    selectedPlayers.value.splice(index, 1);
  } else {
    selectedPlayers.value.push(playerId);
    selectionOrder.value++;
  }
  updatePlayerSelectionState();
};

const clearSelection = () => {
  selectedPlayers.value = [];
  selectionOrder.value = 0;
  updatePlayerSelectionState();
};

const updatePlayerSelectionState = () => {
  allPlayers.value.forEach(player => {
    const selectedIndex = selectedPlayers.value.indexOf(player.id);
    player.isSelected = selectedIndex > -1;
    player.isMultiSelected = selectedPlayers.value.length > 1 && selectedIndex > -1;
    player.selectionOrder = selectedIndex > -1 ? selectedIndex + 1 : 0;
  });
};

// プレイヤードラッグ機能
const startPlayerDrag = (playerId: string, event: MouseEvent) => {
  const container = canvasContainer.value;
  if (!container) return;

  const startX = event.clientX;
  const startY = event.clientY;

  const player = allPlayers.value.find(p => p.id === playerId);
  if (!player) return;

  const startLogicalPos = { x: player.logicalX, y: player.logicalY };

  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX;
    const deltaY = moveEvent.clientY - startY;

    // スクリーン座標での移動量を論理座標に変換
    const logicalDelta = {
      x: deltaX / viewport.value.scale,
      y: deltaY / viewport.value.scale,
    };

    const newPosition = {
      x: startLogicalPos.x + logicalDelta.x,
      y: startLogicalPos.y + logicalDelta.y,
    };

    // フィールド境界内に制限
    const clampedPosition = clampToBounds(newPosition);

    // プレイヤー位置を更新
    player.logicalX = clampedPosition.x;
    player.logicalY = clampedPosition.y;
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    isDragging.value = false;
    draggedPlayerId.value = null;

    // 位置変更後に自動保存
    saveLogicalPlayerData();
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

// 矩形選択機能
const startRectangleSelection = (event: MouseEvent) => {
  const container = canvasContainer.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const startX = event.clientX - rect.left;
  const startY = event.clientY - rect.top;

  // スクリーン座標を論理座標に変換
  const logicalStart = screenToLogical({ x: startX, y: startY }, viewport.value, container);

  rectangleSelection.value = {
    isActive: true,
    startX: logicalStart.x,
    startY: logicalStart.y,
    endX: logicalStart.x,
    endY: logicalStart.y,
  };
};

const updateRectangleSelection = (event: MouseEvent) => {
  if (!rectangleSelection.value.isActive) return;

  const container = canvasContainer.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const currentX = event.clientX - rect.left;
  const currentY = event.clientY - rect.top;

  // スクリーン座標を論理座標に変換
  const logicalCurrent = screenToLogical({ x: currentX, y: currentY }, viewport.value, container);

  rectangleSelection.value.endX = logicalCurrent.x;
  rectangleSelection.value.endY = logicalCurrent.y;
};

const endRectangleSelection = () => {
  if (!rectangleSelection.value.isActive) return;

  // 矩形内のプレイヤーを選択
  selectPlayersInRectangle();

  rectangleSelection.value.isActive = false;
};

const selectPlayersInRectangle = () => {
  const rect = selectionRectangle.value;
  const selectedIds: string[] = [];

  allPlayers.value.forEach(player => {
    if (
      player.logicalX >= rect.x &&
      player.logicalX <= rect.x + rect.width &&
      player.logicalY >= rect.y &&
      player.logicalY <= rect.y + rect.height
    ) {
      selectedIds.push(player.id);
    }
  });

  selectedPlayers.value = selectedIds;
  updatePlayerSelectionState();
};

// ビューポート制御
const resetViewport = () => {
  const fieldBounds = getFieldBounds(true);
  const container = canvasContainer.value;
  if (container) {
    focusOn(fieldBounds, container);
  }
};

const zoomIn = () => {
  setZoom(viewport.value.scale * 1.2);
};

const zoomOut = () => {
  setZoom(viewport.value.scale / 1.2);
};

// コントロールパネルイベント
const handleBoardSettingsUpdate = (settings: any) => {
  boardSettings.value = settings;
};

const handleLineSettingsUpdate = (settings: any) => {
  lineSettings.value = settings;
};

const handleSetSelectionMode = (mode: string) => {
  isRectangleSelectionMode.value = mode === 'rectangle';
  if (isRectangleSelectionMode.value) {
    clearSelection();
  }
};

const handleAddMarker = () => {
  // マーカー追加機能（未実装）
};

const handleRemoveMarker = () => {
  // マーカー削除機能（未実装）
};

const handleClearPlayers = () => {
  // プレイヤーリセット機能
  players.value.forEach((team, teamIndex) => {
    team.forEach((player, playerIndex) => {
      const initialPos = getInitialPlayerPosition(
        teamIndex === 0 ? 'home' : 'away',
        playerIndex
      );
      player.logicalX = initialPos.x;
      player.logicalY = initialPos.y;
    });
  });
  clearSelection();
};

const handleClearDrawing = () => {
  // SVG描画をクリア
  if (drawingSVGRef.value) {
    drawingSVGRef.value.clearAll();
    console.log('🧹 SVG描画クリア完了');
  }
};

const handleSavePosition = () => {
  showPositionModal.value = true;
};

const handleApplyPosition = (positionName: string) => {
  selectedPosition.value = positionName;
  // ポジション適用機能（未実装）
};

const handleDeletePosition = (positionName: string) => {
  // ポジション削除機能（未実装）
};

const handlePositionSave = (name: string) => {
  positionName.value = name;
  // ポジション保存機能（未実装）
  showPositionModal.value = false;
};

const handlePositionCancel = () => {
  showPositionModal.value = false;
};

const logout = () => {
  authStore.logout();
};

const handleProfile = () => {
  // プロフィール機能（未実装）
};

// ライフサイクル
onMounted(() => {
  // データ移行処理
  convertLegacyData();

  // 初期化処理
  nextTick(() => {
    resetViewport();

    // ナビゲーションヒントを5秒後に非表示
    setTimeout(() => {
      showNavigationHints.value = false;
    }, 5000);
  });
});

/**
 * 既存データの論理座標への変換
 * 旧システムのピクセル座標データを新システムの論理座標に変換
 */
const convertLegacyData = () => {
  console.log('🔄 データ移行処理開始');

  try {
    // LocalStorageの既存プレイヤーデータをチェック
    const legacyPlayers = localStorage.getItem('players');
    const logicalPlayers = localStorage.getItem('players_logical');

    if (legacyPlayers && !logicalPlayers) {
      console.log('📦 旧形式のプレイヤーデータを発見、変換中...');

      const parsedLegacyPlayers = JSON.parse(legacyPlayers);
      const convertedPlayers = defaultCoordinateTransform.convertPlayerData(parsedLegacyPlayers);

      // 論理座標データとして保存
      localStorage.setItem('players_logical', JSON.stringify(convertedPlayers));

      // プレイヤーデータを更新
      updatePlayersFromConvertedData(convertedPlayers);

      console.log('✅ データ変換完了:', convertedPlayers);
    } else if (logicalPlayers) {
      console.log('📋 論理座標データを読み込み中...');

      // 既に変換済みのデータを読み込み
      const parsedLogicalPlayers = JSON.parse(logicalPlayers);
      updatePlayersFromConvertedData(parsedLogicalPlayers);

      console.log('✅ 論理座標データ読み込み完了');
    } else {
      console.log('🆕 新規ユーザー - デフォルト配置を使用');
    }

    // 旧形式の描画データも変換
    convertLegacyDrawingData();

  } catch (error) {
    console.error('❌ データ移行エラー:', error);
    console.log('🔧 デフォルト配置にフォールバック');
  }
};

/**
 * 変換されたプレイヤーデータでプレイヤー配列を更新
 */
const updatePlayersFromConvertedData = (convertedData: any[][]) => {
  convertedData.forEach((team, teamIndex) => {
    if (teamIndex < players.value.length) {
      team.forEach((playerData, playerIndex) => {
        if (playerIndex < players.value[teamIndex].length) {
          const player = players.value[teamIndex][playerIndex];

          // 論理座標を適用
          player.logicalX = playerData.logicalX || playerData.x;
          player.logicalY = playerData.logicalY || playerData.y;

          // 旧データとの互換性のため、x, yも更新
          player.x = player.logicalX;
          player.y = player.logicalY;
        }
      });
    }
  });

  console.log('🎯 プレイヤー配置更新完了');
};

/**
 * 旧形式の描画データを変換（将来のSVG描画システム用）
 */
const convertLegacyDrawingData = () => {
  const legacyDrawing = localStorage.getItem('drawing_paths');

  if (legacyDrawing && !localStorage.getItem('drawing_paths_logical')) {
    console.log('🎨 旧形式の描画データを発見、変換準備中...');

    // 将来のSVG描画システム用にフラグを設定
    localStorage.setItem('drawing_conversion_needed', 'true');

    console.log('📝 描画データ変換は後続のSVG描画システム実装時に処理されます');
  }
};

/**
 * 現在の論理座標データを保存
 */
const saveLogicalPlayerData = () => {
  try {
    const playerData = players.value.map(team =>
      team.map(player => ({
        id: player.id,
        number: player.number,
        team: player.team,
        logicalX: player.logicalX,
        logicalY: player.logicalY,
        x: player.logicalX, // 互換性のため
        y: player.logicalY, // 互換性のため
      }))
    );

    localStorage.setItem('players_logical', JSON.stringify(playerData));
    console.log('💾 論理座標データ保存完了');
  } catch (error) {
    console.error('❌ データ保存エラー:', error);
  }
};

// SVGマウスイベントハンドラー
const handleSVGMouseDown = (event: MouseEvent) => {
  // プレイヤーや矩形選択が優先される場合は描画を開始しない
  if (event.target !== event.currentTarget) {
    return;
  }

  if (event.button === 0) { // 左クリック
    if (isRectangleSelectionMode.value) {
      startRectangleSelection(event);
    } else if (event.shiftKey) {
      // Shiftキー + クリックで描画開始
      startSVGDrawing(event);
    } else {
      // 通常のパン操作
      startPan(event);
      isPanning.value = true;
    }
  }
};

const handleSVGMouseMove = (event: MouseEvent) => {
  if (isDrawing.value) {
    continueSVGDrawing(event);
  } else if (rectangleSelection.value.isActive) {
    updateRectangleSelection(event);
  }
};

const handleSVGMouseUp = (event: MouseEvent) => {
  if (isDrawing.value) {
    endSVGDrawing();
  } else if (rectangleSelection.value.isActive) {
    endRectangleSelection();
  }
  isPanning.value = false;
};

// 描画機能
const startSVGDrawing = (event: MouseEvent) => {
  const container = canvasContainer.value;
  if (!container || !drawingSVGRef.value || isRectangleSelectionMode.value) return;

  const rect = container.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  // スクリーン座標を論理座標に変換
  const logicalPos = screenToLogical({ x: screenX, y: screenY }, viewport.value, container);

  isDrawing.value = true;
  drawingSVGRef.value.startDrawing(logicalPos);

  console.log('🎨 描画開始:', logicalPos);
};

const continueSVGDrawing = (event: MouseEvent) => {
  const container = canvasContainer.value;
  if (!container || !drawingSVGRef.value || !isDrawing.value) return;

  const rect = container.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  // スクリーン座標を論理座標に変換
  const logicalPos = screenToLogical({ x: screenX, y: screenY }, viewport.value, container);

  drawingSVGRef.value.continueDrawing(logicalPos);
};

const endSVGDrawing = () => {
  if (!drawingSVGRef.value || !isDrawing.value) return;

  drawingSVGRef.value.endDrawing();
  isDrawing.value = false;

  console.log('🎨 描画終了');
};

// 描画イベントハンドラー
const handleDrawingStart = (position: LogicalPosition) => {
  console.log('📝 描画開始イベント:', position);
};

const handleDrawingMove = (position: LogicalPosition) => {
  // 描画中の処理（必要に応じて実装）
};

const handleDrawingEnd = (stroke: any) => {
  console.log('✅ 描画完了:', stroke);
};

const handleStrokesChange = (strokes: any[]) => {
  drawingStrokes.value = strokes;
  console.log('🖊️ ストローク更新:', strokes.length, '本');
};

onUnmounted(() => {
  // クリーンアップ処理
});
</script>

<style scoped>
.figma-like-rugby-board {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  background-color: #f8f9fa;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  z-index: 100;
}

.board-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.viewport-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #f1f3f4;
  border-radius: 8px;
}

.control-button {
  padding: 6px 8px;
  border: none;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.control-button:hover {
  background: #e8f0fe;
  transform: scale(1.05);
}

.zoom-indicator {
  font-size: 12px;
  font-weight: 600;
  color: #5f6368;
  min-width: 40px;
  text-align: center;
}

.board-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f8f9fa;
}

.canvas-area.pan-cursor {
  cursor: grabbing;
}

.canvas-area.selection-cursor {
  cursor: crosshair;
}

.infinite-canvas {
  width: 100%;
  height: 100%;
  background: transparent;
  cursor: grab;
}

.infinite-canvas:active {
  cursor: grabbing;
}

.selection-rectangle {
  fill: rgba(0, 123, 255, 0.1);
  stroke: #007bff;
  stroke-width: 1;
  stroke-dasharray: 5,5;
}

.control-panel-fixed {
  width: 320px;
  border-left: 1px solid #e9ecef;
  background: white;
  overflow-y: auto;
}

.navigation-hints {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  animation: fadeInOut 5s ease-in-out;
}

.hint {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.hint:last-child {
  margin-bottom: 0;
}

.hint-key {
  font-weight: bold;
  margin-right: 12px;
}

.hint-action {
  color: #ccc;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 1; }
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .board-header {
    padding: 8px 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .board-title {
    font-size: 20px;
  }

  .control-panel-fixed {
    width: 280px;
  }

  .navigation-hints {
    font-size: 10px;
    padding: 8px 12px;
  }
}
</style>
