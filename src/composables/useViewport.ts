import { ref, computed, type Ref } from 'vue';

/**
 * ビューポート状態の定義
 */
export interface Viewport {
  centerX: number; // 表示中心のX座標（論理座標）
  centerY: number; // 表示中心のY座標（論理座標）
  scale: number;   // ズーム倍率（0.1 ~ 3.0）
}

/**
 * 論理座標系の位置
 */
export interface LogicalPosition {
  x: number; // フィールド上の論理座標（-100 ~ 100など）
  y: number; // フィールド上の論理座標（-50 ~ 50など）
}

/**
 * スクリーン座標系の位置
 */
export interface ScreenPosition {
  x: number; // 画面上のピクセル座標
  y: number; // 画面上のピクセル座標
}

/**
 * Figmaライクなビューポート管理コンポーザブル
 * 無限キャンバスのズーム・パン機能を提供
 */
export const useViewport = () => {
  // ビューポート状態
  const viewport = ref<Viewport>({
    centerX: 0,   // フィールド中心を初期位置
    centerY: 0,   // フィールド中心を初期位置
    scale: 1.0,   // 初期ズーム倍率
  });

  // ズーム制限
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 3.0;

  // パン感度設定
  const PAN_SENSITIVITY = 1.0;

  /**
   * マウスホイールイベントハンドラー
   * Ctrl/Cmd + ホイール：ズーム操作
   * ホイールのみ：パン操作
   */
  const handleWheel = (event: WheelEvent, containerElement: HTMLElement) => {
    event.preventDefault();

    if (event.ctrlKey || event.metaKey) {
      // ズーム操作
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, viewport.value.scale * zoomFactor)
      );

      // マウス位置を中心にズーム
      const containerRect = containerElement.getBoundingClientRect();
      const mouseX = event.clientX - containerRect.left;
      const mouseY = event.clientY - containerRect.top;

      // マウス位置の論理座標を計算
      const logicalMousePos = screenToLogical(
        { x: mouseX, y: mouseY },
        viewport.value,
        containerElement
      );

      // スケール変更
      viewport.value.scale = newScale;

      // マウス位置が同じスクリーン座標にくるように中心を調整
      const newScreenPos = logicalToScreen(
        logicalMousePos,
        viewport.value,
        containerElement
      );

      const offsetX = mouseX - newScreenPos.x;
      const offsetY = mouseY - newScreenPos.y;

      viewport.value.centerX += offsetX / viewport.value.scale;
      viewport.value.centerY += offsetY / viewport.value.scale;
    } else {
      // パン操作
      const panSensitivity = PAN_SENSITIVITY / viewport.value.scale;
      viewport.value.centerX += event.deltaX * panSensitivity;
      viewport.value.centerY += event.deltaY * panSensitivity;
    }
  };

  /**
   * マウスドラッグによるパン操作
   */
  const startPan = (event: MouseEvent) => {
    const startX = event.clientX;
    const startY = event.clientY;
    const startCenterX = viewport.value.centerX;
    const startCenterY = viewport.value.centerY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const panSensitivity = PAN_SENSITIVITY / viewport.value.scale;
      viewport.value.centerX = startCenterX - deltaX * panSensitivity;
      viewport.value.centerY = startCenterY - deltaY * panSensitivity;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * ズームレベルを設定
   */
  const setZoom = (scale: number) => {
    viewport.value.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
  };

  /**
   * ビューポートを中心にリセット
   */
  const resetViewport = () => {
    viewport.value.centerX = 0;
    viewport.value.centerY = 0;
    viewport.value.scale = 1.0;
  };

  /**
   * 特定の領域にフォーカス
   */
  const focusOn = (bounds: { minX: number; maxX: number; minY: number; maxY: number }, containerElement: HTMLElement) => {
    const containerRect = containerElement.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // 境界の中心に移動
    viewport.value.centerX = (bounds.minX + bounds.maxX) / 2;
    viewport.value.centerY = (bounds.minY + bounds.maxY) / 2;

    // 境界が画面内に収まるスケールを計算
    const boundsWidth = bounds.maxX - bounds.minX;
    const boundsHeight = bounds.maxY - bounds.minY;

    const scaleX = containerWidth / boundsWidth * 0.8; // 少し余裕を持たせる
    const scaleY = containerHeight / boundsHeight * 0.8;

    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.min(scaleX, scaleY)));
    viewport.value.scale = newScale;
  };

  /**
   * 現在のビューボックス文字列を取得（SVG用）
   */
  const viewBoxString = computed(() => {
    const containerWidth = 800; // デフォルトのコンテナ幅
    const containerHeight = 600; // デフォルトのコンテナ高さ

    const logicalWidth = containerWidth / viewport.value.scale;
    const logicalHeight = containerHeight / viewport.value.scale;

    const minX = viewport.value.centerX - logicalWidth / 2;
    const minY = viewport.value.centerY - logicalHeight / 2;

    return `${minX} ${minY} ${logicalWidth} ${logicalHeight}`;
  });

  return {
    viewport: viewport as Ref<Viewport>,
    handleWheel,
    startPan,
    setZoom,
    resetViewport,
    focusOn,
    viewBoxString,
  };
};

/**
 * 論理座標からスクリーン座標への変換
 */
export const logicalToScreen = (
  logical: LogicalPosition,
  viewport: Viewport,
  containerElement: HTMLElement
): ScreenPosition => {
  const containerRect = containerElement.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  return {
    x: (logical.x - viewport.centerX) * viewport.scale + centerX,
    y: (logical.y - viewport.centerY) * viewport.scale + centerY,
  };
};

/**
 * スクリーン座標から論理座標への変換
 */
export const screenToLogical = (
  screen: ScreenPosition,
  viewport: Viewport,
  containerElement: HTMLElement
): LogicalPosition => {
  const containerRect = containerElement.getBoundingClientRect();
  const centerX = containerRect.width / 2;
  const centerY = containerRect.height / 2;

  return {
    x: (screen.x - centerX) / viewport.scale + viewport.centerX,
    y: (screen.y - centerY) / viewport.scale + viewport.centerY,
  };
};
