import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSelectionManager } from '@/composables/use-selection-manager';
import type { Player } from '@/types/rugby';

// HTMLElementのモック
const mockGetBoundingClientRect = vi.fn(() => ({
  left: 100,
  top: 50,
  width: 800,
  height: 600,
}));

const createMockMouseEvent = (clientX: number, clientY: number) => ({
  clientX,
  clientY,
  currentTarget: {
    getBoundingClientRect: mockGetBoundingClientRect,
  },
}) as MouseEvent;

// テスト用のプレイヤーデータ
const createTestPlayers = (): Player[][] => [
  [
    // チーム1
    { id: 'p1', number: 1, x: 100, y: 100 },
    { id: 'p2', number: 2, x: 200, y: 100 },
    { id: 'p3', number: 3, x: 50, y: 200 },
  ],
  [
    // チーム2
    { id: 'p4', number: 4, x: 150, y: 150 },
    { id: 'p5', number: 5, x: 300, y: 100 },
    { id: 'p6', number: 6, x: 100, y: 300 },
  ],
];

describe('useSelectionManager', () => {
  beforeEach(() => {
    mockGetBoundingClientRect.mockClear();
  });

  it('初期状態が正しく設定される', () => {
    const manager = useSelectionManager();

    expect(manager.currentMode.value).toBe('normal');
    expect(manager.isRectangleMode.value).toBe(false);
    expect(manager.selectedPlayers.value).toEqual([]);
    expect(manager.rectangle.value.isActive).toBe(false);
  });

  it('選択モードを切り替えできる', () => {
    const manager = useSelectionManager();

    manager.setMode('rectangle');
    expect(manager.currentMode.value).toBe('rectangle');
    expect(manager.isRectangleMode.value).toBe(true);

    manager.setMode('normal');
    expect(manager.currentMode.value).toBe('normal');
    expect(manager.isRectangleMode.value).toBe(false);
  });

  it('選択モードをトグルできる', () => {
    const manager = useSelectionManager();

    manager.toggleMode();
    expect(manager.currentMode.value).toBe('rectangle');

    manager.toggleMode();
    expect(manager.currentMode.value).toBe('normal');
  });

  it('矩形選択を開始・更新・完了できる', () => {
    const manager = useSelectionManager();
    const players = createTestPlayers();

    manager.setMode('rectangle');

    // 矩形選択開始 (50, 50)
    const startEvent = createMockMouseEvent(150, 100);
    manager.startRectangleSelection(startEvent);

    expect(manager.rectangle.value.isActive).toBe(true);
    expect(manager.rectangle.value.startX).toBe(50);
    expect(manager.rectangle.value.startY).toBe(50);

    // 矩形選択更新 (200, 200) - 矩形領域を拡張
    const updateEvent = createMockMouseEvent(300, 250);
    manager.updateRectangleSelection(updateEvent);

    expect(manager.rectangle.value.endX).toBe(200);
    expect(manager.rectangle.value.endY).toBe(200);

    // 矩形選択完了 - 矩形内のプレイヤーが選択される
    manager.completeRectangleSelection(players);

    expect(manager.rectangle.value.isActive).toBe(false);
    expect(manager.selectedPlayers.value.length).toBeGreaterThan(0);

    // 矩形内のプレイヤー（100,100）（200,100）（150,150）が選択されているはず
    const selectedIds = manager.selectedPlayers.value.map(p => p.id);
    expect(selectedIds).toContain('p1'); // (100, 100)
    expect(selectedIds).toContain('p2'); // (200, 100)
    expect(selectedIds).toContain('p4'); // (150, 150)
  });

  it('矩形選択時に既存選択がクリアされる', () => {
    const manager = useSelectionManager();
    const players = createTestPlayers();

    // 先に通常選択でプレイヤーを選択
    manager.selectPlayer('p1', 0, 0, false);
    expect(manager.selectedPlayers.value.length).toBe(1);

    // 矩形選択モードに切り替え
    manager.setMode('rectangle');

    // 矩形選択を実行
    const startEvent = createMockMouseEvent(150, 100);
    manager.startRectangleSelection(startEvent);

    const updateEvent = createMockMouseEvent(300, 250);
    manager.updateRectangleSelection(updateEvent);

    manager.completeRectangleSelection(players);

    // 既存選択がクリアされて、新しい矩形選択が適用される
    expect(manager.selectedPlayers.value.length).toBeGreaterThan(0);
    // 新しい選択にはp1も含まれるが、元の選択はクリアされている
  });

  it('矩形が非アクティブ時は矩形選択完了が何もしない', () => {
    const manager = useSelectionManager();
    const players = createTestPlayers();

    // 先に通常選択でプレイヤーを選択
    manager.selectPlayer('p1', 0, 0, false);
    const initialSelectionCount = manager.selectedPlayers.value.length;

    // 矩形選択を開始せずに完了を呼び出し
    manager.completeRectangleSelection(players);

    // 選択状態が変更されない
    expect(manager.selectedPlayers.value.length).toBe(initialSelectionCount);
  });

  it('IDがないプレイヤーは矩形選択で無視される', () => {
    const manager = useSelectionManager();
    const playersWithNoId: Player[][] = [
      [
        { number: 1, x: 100, y: 100 }, // IDなし
        { id: 'p2', number: 2, x: 150, y: 100 },
      ],
      [],
    ];

    manager.setMode('rectangle');

    // 矩形選択を実行
    const startEvent = createMockMouseEvent(150, 100);
    manager.startRectangleSelection(startEvent);

    const updateEvent = createMockMouseEvent(250, 150);
    manager.updateRectangleSelection(updateEvent);

    manager.completeRectangleSelection(playersWithNoId);

    // IDがあるプレイヤーのみ選択される
    expect(manager.selectedPlayers.value.length).toBe(1);
    expect(manager.selectedPlayers.value[0].id).toBe('p2');
  });

  it('選択解除が正常に動作する', () => {
    const manager = useSelectionManager();

    // プレイヤーを選択
    manager.selectPlayer('p1', 0, 0, false);
    manager.selectPlayer('p2', 0, 1, true);
    expect(manager.selectedPlayers.value.length).toBe(2);

    // 選択解除
    manager.clearSelection();
    expect(manager.selectedPlayers.value.length).toBe(0);
  });

  it('プレイヤー選択状態の判定が正常に動作する', () => {
    const manager = useSelectionManager();

    // プレイヤーを選択
    manager.selectPlayer('p1', 0, 0, false);

    expect(manager.isPlayerSelected('p1')).toBe(true);
    expect(manager.isPlayerSelected('p2')).toBe(false);
  });
});
