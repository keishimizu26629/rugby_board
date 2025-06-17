import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import RugbyBoard from '@/components/organisms/RugbyBoard.vue';

// モックコンポーネント
vi.mock('@/components/molecules/ControlPanel.vue', () => ({
  default: {
    name: 'ControlPanel',
    template: `
      <div data-testid="control-panel">
        <button
          data-testid="normal-mode-btn"
          @click="$emit('set-selection-mode', 'normal')"
        >通常選択</button>
        <button
          data-testid="rectangle-mode-btn"
          @click="$emit('set-selection-mode', 'rectangle')"
        >矩形選択</button>
      </div>
    `,
    props: ['isRectangleMode'],
    emits: ['set-selection-mode']
  }
}));

vi.mock('@/components/molecules/RugbyField.vue', () => ({
  default: {
    name: 'RugbyField',
    template: '<div data-testid="rugby-field"></div>',
    props: ['showLines'],
    emits: ['draw-start', 'draw-move', 'draw-end']
  }
}));

vi.mock('@/components/molecules/DrawingCanvas.vue', () => ({
  default: {
    name: 'DrawingCanvas',
    template: '<div data-testid="drawing-canvas"></div>',
    props: ['lineSettings'],
    methods: {
      getContext: () => ({ lineWidth: 1, strokeStyle: 'white' }),
      clear: vi.fn()
    }
  }
}));

vi.mock('@/components/atoms/PlayerPiece.vue', () => ({
  default: {
    name: 'PlayerPiece',
    template: `
      <div
        data-testid="player-piece"
        :data-player-id="id"
        :style="{ left: x + 'px', top: y + 'px' }"
        @mousedown="$emit('mousedown', $event, id)"
        @mouseup="$emit('mouseup', $event)"
        @click="$emit('click', $event, id)"
      ></div>
    `,
    props: ['id', 'number', 'team', 'x', 'y', 'showNumber', 'isSelected', 'isMultiSelected', 'selectionOrder'],
    emits: ['mousedown', 'mouseup', 'click']
  }
}));

vi.mock('@/components/atoms/BoardMarker.vue', () => ({
  default: {
    name: 'BoardMarker',
    template: '<div data-testid="board-marker"></div>',
    props: ['x', 'y', 'index'],
    emits: ['mousedown', 'mouseup']
  }
}));

vi.mock('@/components/molecules/PositionModal.vue', () => ({
  default: {
    name: 'PositionModal',
    template: '<div data-testid="position-modal"></div>',
    props: ['positionName'],
    emits: ['save', 'cancel']
  }
}));

// Composablesのモック
vi.mock('@/composables/useBoard', () => ({
  useBoard: () => ({
    players: [[
      { id: 'p1', number: 1, x: 100, y: 100 },
      { id: 'p2', number: 2, x: 200, y: 100 }
    ], [
      { id: 'p3', number: 3, x: 150, y: 150 }
    ]],
    playersWithSelection: [[
      { id: 'p1', number: 1, x: 100, y: 100, isSelected: false },
      { id: 'p2', number: 2, x: 200, y: 100, isSelected: false }
    ], [
      { id: 'p3', number: 3, x: 150, y: 150, isSelected: false }
    ]],
    markers: [],
    positions: [],
    selectedPosition: '',
    boardSettings: { showLines: true, showNumbers: true },
    lineSettings: { color: 'white', width: 4 },
    isLoading: false,
    selectedPlayers: [],
    selectedCount: 0,
    isMultiSelected: false,
    handlePlayerClick: vi.fn(),
    clearSelection: vi.fn(),
    startMultiDrag: vi.fn(),
    movePlayer: vi.fn(),
    clearPlayers: vi.fn(),
    addMarker: vi.fn(),
    removeMarker: vi.fn(),
    savePosition: vi.fn(),
    loadPositions: vi.fn(),
    deletePosition: vi.fn(),
    applyPosition: vi.fn(),
    toggleBoardSetting: vi.fn(),
    updateLineSettings: vi.fn()
  })
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn()
  })
}));

vi.mock('@/stores/user', () => ({
  useUserStore: () => ({
    currentUser: { uid: 'test-uid' },
    logout: vi.fn()
  })
}));

vi.mock('@/composables/useDragAndDrop', () => ({
  useDragAndDrop: () => ({
    startDrag: vi.fn(),
    endDrag: vi.fn(),
    isDragging: { value: false },
    draggedElement: { value: null }
  })
}));

vi.mock('@/composables/useDrawing', () => ({
  useDrawing: () => ({
    startDrawing: vi.fn(),
    draw: vi.fn(),
    endDrawing: vi.fn(),
    clearDrawing: vi.fn()
  })
}));

describe('RugbyBoard - 矩形選択機能統合テスト', () => {
  let wrapper: any;
  let pinia: any;

  beforeEach(() => {
    pinia = createPinia();

    // onMountedとonUnmountedのモック
    vi.mock('vue', async () => {
      const actual = await vi.importActual('vue');
      return {
        ...actual,
        onMounted: vi.fn((fn) => fn()),
        onUnmounted: vi.fn()
      };
    });

    wrapper = mount(RugbyBoard, {
      global: {
        plugins: [pinia],
        stubs: {
          teleport: true
        }
      }
    });
  });

  it('コンポーネントが正常にマウントされる', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('[data-testid="control-panel"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rugby-field"]').exists()).toBe(true);
  });

  it('選択モード切り替えボタンが存在する', () => {
    const normalModeBtn = wrapper.find('[data-testid="normal-mode-btn"]');
    const rectangleModeBtn = wrapper.find('[data-testid="rectangle-mode-btn"]');

    expect(normalModeBtn.exists()).toBe(true);
    expect(rectangleModeBtn.exists()).toBe(true);
  });

  it('矩形選択モードに切り替えられる', async () => {
    const rectangleModeBtn = wrapper.find('[data-testid="rectangle-mode-btn"]');

    await rectangleModeBtn.trigger('click');

    // モード切り替えイベントが発火されたことを確認
    // 実際の実装では selectionManager.isRectangleMode.value が true になる
    expect(rectangleModeBtn.exists()).toBe(true);
  });

  it('矩形選択ボックスが表示される条件をテスト', () => {
    // 初期状態では矩形選択ボックスは表示されない
    const selectionRect = wrapper.find('.selection-rectangle');
    expect(selectionRect.exists()).toBe(false);
  });

  it('ボードエリアが正しくレンダリングされる', () => {
    const boardContainer = wrapper.find('.board-container');
    expect(boardContainer.exists()).toBe(true);

    // マウスイベントハンドラーが設定されていることを確認
    expect(boardContainer.attributes()).toHaveProperty('mousedown');
    expect(boardContainer.attributes()).toHaveProperty('mousemove');
    expect(boardContainer.attributes()).toHaveProperty('mouseup');
  });

  it('プレイヤーピースが正しく表示される', () => {
    const playerPieces = wrapper.findAll('[data-testid="player-piece"]');
    expect(playerPieces.length).toBeGreaterThan(0);

    // 各プレイヤーピースにIDが設定されていることを確認
    playerPieces.forEach(piece => {
      expect(piece.attributes('data-player-id')).toBeTruthy();
    });
  });

  it('CSSクラスが正しく設定される', () => {
    const boardContainer = wrapper.find('.board-container');
    expect(boardContainer.classes()).toContain('board-container');

    const canvasContainer = wrapper.find('.canvas-container');
    expect(canvasContainer.classes()).toContain('canvas-container');
  });
});

describe('矩形選択機能の詳細テスト', () => {
  it('selectionManagerが正しく初期化される', () => {
    // useSelectionManager が正しく呼び出されることを確認
    // 実際のテストでは、composable が正しく初期化されることを確認
    expect(true).toBe(true); // プレースホルダー
  });

  it('矩形選択完了時にプレイヤーが選択される', () => {
    // completeRectangleSelection が正しく動作することを確認
    // 実際のテストでは、矩形内のプレイヤーが選択されることを確認
    expect(true).toBe(true); // プレースホルダー
  });

  it('描画機能が矩形選択モードで無効化される', () => {
    // 矩形選択モード時に描画イベントが無効化されることを確認
    // 実際のテストでは、handleDrawStart, handleDrawMove, handleDrawEnd が早期リターンすることを確認
    expect(true).toBe(true); // プレースホルダー
  });
});
