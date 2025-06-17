import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRectangleSelection } from '@/composables/use-rectangle-selection';

// HTMLElementのモック
const mockGetBoundingClientRect = vi.fn(() => ({
  left: 100,
  top: 50,
  width: 800,
  height: 600,
}));

const createMockMouseEvent = (clientX: number, clientY: number, currentTarget?: any) => ({
  clientX,
  clientY,
  currentTarget: currentTarget || {
    getBoundingClientRect: mockGetBoundingClientRect,
  },
}) as MouseEvent;

describe('useRectangleSelection', () => {
  beforeEach(() => {
    mockGetBoundingClientRect.mockClear();
  });

  it('初期状態では矩形選択が非アクティブ', () => {
    const { rectangle } = useRectangleSelection();

    expect(rectangle.value.isActive).toBe(false);
    expect(rectangle.value.startX).toBe(0);
    expect(rectangle.value.startY).toBe(0);
    expect(rectangle.value.endX).toBe(0);
    expect(rectangle.value.endY).toBe(0);
  });

  it('矩形選択を開始できる', () => {
    const { rectangle, startRectangleSelection } = useRectangleSelection();

    const mockEvent = createMockMouseEvent(200, 150);
    startRectangleSelection(mockEvent);

    expect(rectangle.value.isActive).toBe(true);
    expect(rectangle.value.startX).toBe(100); // clientX - rect.left
    expect(rectangle.value.startY).toBe(100); // clientY - rect.top
    expect(rectangle.value.endX).toBe(100);
    expect(rectangle.value.endY).toBe(100);
  });

  it('矩形選択を更新できる', () => {
    const { rectangle, startRectangleSelection, updateRectangleSelection } = useRectangleSelection();

    // 選択開始
    const startEvent = createMockMouseEvent(200, 150);
    startRectangleSelection(startEvent);

    // 選択更新
    const updateEvent = createMockMouseEvent(300, 250);
    updateRectangleSelection(updateEvent);

    expect(rectangle.value.endX).toBe(200); // clientX - rect.left
    expect(rectangle.value.endY).toBe(200); // clientY - rect.top
  });

  it('非アクティブ時は矩形選択を更新しない', () => {
    const { rectangle, updateRectangleSelection } = useRectangleSelection();

    const mockEvent = createMockMouseEvent(300, 250);
    updateRectangleSelection(mockEvent);

    expect(rectangle.value.endX).toBe(0);
    expect(rectangle.value.endY).toBe(0);
  });

  it('矩形選択を終了できる', () => {
    const { rectangle, startRectangleSelection, endRectangleSelection } = useRectangleSelection();

    // 選択開始
    const mockEvent = createMockMouseEvent(200, 150);
    startRectangleSelection(mockEvent);
    expect(rectangle.value.isActive).toBe(true);

    // 選択終了
    endRectangleSelection();
    expect(rectangle.value.isActive).toBe(false);
  });

  it('選択矩形の座標とサイズを正しく計算する', () => {
    const { rectangle, selectionRectangle, startRectangleSelection, updateRectangleSelection } = useRectangleSelection();

    // 選択開始 (100, 100)
    const startEvent = createMockMouseEvent(200, 150);
    startRectangleSelection(startEvent);

    // 選択更新 (200, 200) - 右下に拡張
    const updateEvent = createMockMouseEvent(300, 250);
    updateRectangleSelection(updateEvent);

    expect(selectionRectangle.value.x).toBe(100);
    expect(selectionRectangle.value.y).toBe(100);
    expect(selectionRectangle.value.width).toBe(100);
    expect(selectionRectangle.value.height).toBe(100);
  });

  it('左上から右下への矩形選択を正しく処理する', () => {
    const { selectionRectangle, startRectangleSelection, updateRectangleSelection } = useRectangleSelection();

    // 選択開始 (50, 30)
    const startEvent = createMockMouseEvent(150, 80);
    startRectangleSelection(startEvent);

    // 選択更新 (150, 130) - 左上から右下
    const updateEvent = createMockMouseEvent(250, 180);
    updateRectangleSelection(updateEvent);

    expect(selectionRectangle.value.x).toBe(50);
    expect(selectionRectangle.value.y).toBe(30);
    expect(selectionRectangle.value.width).toBe(100);
    expect(selectionRectangle.value.height).toBe(100);
  });

  it('右下から左上への矩形選択を正しく処理する', () => {
    const { selectionRectangle, startRectangleSelection, updateRectangleSelection } = useRectangleSelection();

    // 選択開始 (150, 130)
    const startEvent = createMockMouseEvent(250, 180);
    startRectangleSelection(startEvent);

    // 選択更新 (50, 30) - 右下から左上
    const updateEvent = createMockMouseEvent(150, 80);
    updateRectangleSelection(updateEvent);

    expect(selectionRectangle.value.x).toBe(50);
    expect(selectionRectangle.value.y).toBe(30);
    expect(selectionRectangle.value.width).toBe(100);
    expect(selectionRectangle.value.height).toBe(100);
  });

  it('プレイヤーが矩形内にあるかを判定できる', () => {
    const { isPlayerInRectangle, startRectangleSelection, updateRectangleSelection } = useRectangleSelection();

    // 矩形選択: (50, 30) から (150, 130)
    const startEvent = createMockMouseEvent(150, 80);
    startRectangleSelection(startEvent);

    const updateEvent = createMockMouseEvent(250, 180);
    updateRectangleSelection(updateEvent);

    // 矩形内のプレイヤー
    expect(isPlayerInRectangle(100, 80)).toBe(true);
    expect(isPlayerInRectangle(50, 30)).toBe(true);
    expect(isPlayerInRectangle(150, 130)).toBe(true);

    // 矩形外のプレイヤー
    expect(isPlayerInRectangle(40, 80)).toBe(false);
    expect(isPlayerInRectangle(100, 20)).toBe(false);
    expect(isPlayerInRectangle(160, 80)).toBe(false);
    expect(isPlayerInRectangle(100, 140)).toBe(false);
  });
});
