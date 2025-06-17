import { ref } from 'vue';
import type { LineSettings } from '@/types/rugby';

/**
 * 描画線の座標点
 */
interface Point {
  x: number;
  y: number;
}

/**
 * 描画機能を提供するコンポーザブル
 */
export function useDrawing() {
  const isDrawing = ref(false);
  const currentPath = ref<Point[]>([]);
  const allPaths = ref<Point[][]>([]);
  const context = ref<CanvasRenderingContext2D | null>(null);

  /**
   * 描画開始処理
   * @param event - マウスイベント
   * @param ctx - キャンバスコンテキスト
   */
  const startDrawing = (event: MouseEvent, ctx?: CanvasRenderingContext2D) => {
    if (!ctx) return;

    isDrawing.value = true;
    context.value = ctx;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    currentPath.value = [{
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }];
  };

  /**
   * 描画中の処理
   * @param event - マウスイベント
   */
  const draw = (event: MouseEvent) => {
    if (!isDrawing.value || !context.value) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    currentPath.value.push(point);
  };

  /**
   * 描画終了処理
   * @param _event - マウスイベント（オプション、現在未使用）
   */
  const endDrawing = (_event?: MouseEvent) => {
    if (isDrawing.value && currentPath.value.length > 0) {
      allPaths.value.push([...currentPath.value]);
    }
    isDrawing.value = false;
    context.value = null;
    currentPath.value = [];
  };

  /**
   * 描画をクリア
   */
  const clearDrawing = () => {
    allPaths.value = [];
    currentPath.value = [];
    isDrawing.value = false;
    context.value = null;
  };

  /**
   * 線のスタイルをセット
   * @param ctx - キャンバスコンテキスト
   * @param lineSettings - 線の設定
   */
  const setLineStyle = (ctx: CanvasRenderingContext2D, lineSettings: LineSettings) => {
    ctx.lineWidth = lineSettings.width;
    ctx.strokeStyle = lineSettings.color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  return {
    isDrawing,
    currentPath,
    allPaths,
    startDrawing,
    draw,
    endDrawing,
    clearDrawing,
    setLineStyle
  };
}
