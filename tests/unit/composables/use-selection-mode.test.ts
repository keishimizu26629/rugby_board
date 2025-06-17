import { describe, it, expect } from 'vitest';
import { useSelectionMode } from '@/composables/use-selection-mode';

describe('useSelectionMode', () => {
  it('初期状態は通常選択モード', () => {
    const { currentMode, isRectangleMode } = useSelectionMode();

    expect(currentMode.value).toBe('normal');
    expect(isRectangleMode.value).toBe(false);
  });

  it('矩形選択モードに切り替えできる', () => {
    const { currentMode, isRectangleMode, setMode } = useSelectionMode();

    setMode('rectangle');

    expect(currentMode.value).toBe('rectangle');
    expect(isRectangleMode.value).toBe(true);
  });

  it('通常選択モードに戻せる', () => {
    const { currentMode, isRectangleMode, setMode } = useSelectionMode();

    setMode('rectangle');
    setMode('normal');

    expect(currentMode.value).toBe('normal');
    expect(isRectangleMode.value).toBe(false);
  });

  it('トグル機能が正常に動作する', () => {
    const { currentMode, isRectangleMode, toggleMode } = useSelectionMode();

    // 初期状態：normal
    expect(currentMode.value).toBe('normal');

    // 1回目のトグル：normal -> rectangle
    toggleMode();
    expect(currentMode.value).toBe('rectangle');
    expect(isRectangleMode.value).toBe(true);

    // 2回目のトグル：rectangle -> normal
    toggleMode();
    expect(currentMode.value).toBe('normal');
    expect(isRectangleMode.value).toBe(false);
  });
});
