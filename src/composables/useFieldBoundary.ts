import type { LogicalPosition } from './useViewport';

/**
 * ラグビーフィールドの境界定義
 * 実際のラグビーフィールドサイズに基づく論理座標
 */
export interface FieldBounds {
  minX: number; // フィールド左端
  maxX: number; // フィールド右端
  minY: number; // フィールド上端
  maxY: number; // フィールド下端
}

/**
 * フィールド境界制御コンポーザブル
 * プレイヤーの配置をフィールド内に制限する機能を提供
 */
export const useFieldBoundary = () => {
  // ラグビーフィールドの論理的な境界を定義
  // 実際のフィールドサイズ: 100m × 70m（インゴール含まず）
  // インゴール: 10m × 2
  // 全体: 120m × 70m
  const FIELD_BOUNDS: FieldBounds = {
    minX: -60,  // フィールド幅120m → 論理座標-60~60
    maxX: 60,
    minY: -35,  // フィールド長さ70m → 論理座標-35~35
    maxY: 35,
  };

  // インゴールを含む全境界
  const FULL_FIELD_BOUNDS: FieldBounds = {
    minX: -60,  // 幅は同じ
    maxX: 60,
    minY: -45,  // インゴール含む全長90m → 論理座標-45~45
    maxY: 45,
  };

  // タッチライン付近の安全マージン
  const SAFETY_MARGIN = 2; // 論理座標単位

  /**
   * プレイヤー配置が境界内かチェック
   * @param position - チェックしたい位置
   * @param includeInGoal - インゴールエリアを含むかどうか
   * @returns 境界内の場合true
   */
  const isWithinBounds = (position: LogicalPosition, includeInGoal = true): boolean => {
    const bounds = includeInGoal ? FULL_FIELD_BOUNDS : FIELD_BOUNDS;

    return (
      position.x >= bounds.minX &&
      position.x <= bounds.maxX &&
      position.y >= bounds.minY &&
      position.y <= bounds.maxY
    );
  };

  /**
   * 境界内に収める（クランプ）
   * @param position - 元の位置
   * @param includeInGoal - インゴールエリアを含むかどうか
   * @returns 境界内に収められた位置
   */
  const clampToBounds = (position: LogicalPosition, includeInGoal = true): LogicalPosition => {
    const bounds = includeInGoal ? FULL_FIELD_BOUNDS : FIELD_BOUNDS;

    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
    };
  };

  /**
   * 安全マージンを考慮して境界内に収める
   * @param position - 元の位置
   * @param includeInGoal - インゴールエリアを含むかどうか
   * @returns 安全マージンを考慮した境界内の位置
   */
  const clampToSafeBounds = (position: LogicalPosition, includeInGoal = true): LogicalPosition => {
    const bounds = includeInGoal ? FULL_FIELD_BOUNDS : FIELD_BOUNDS;

    return {
      x: Math.max(bounds.minX + SAFETY_MARGIN, Math.min(bounds.maxX - SAFETY_MARGIN, position.x)),
      y: Math.max(bounds.minY + SAFETY_MARGIN, Math.min(bounds.maxY - SAFETY_MARGIN, position.y)),
    };
  };

  /**
   * フィールドの特定エリア内かチェック
   * @param position - チェックしたい位置
   * @param area - エリアタイプ
   * @returns エリア内の場合true
   */
  const isWithinArea = (position: LogicalPosition, area: 'in-goal' | '22m' | '10m' | 'halfway'): boolean => {
    switch (area) {
      case 'in-goal':
        return (
          (position.y >= 35 && position.y <= 45) || // 上側インゴール
          (position.y >= -45 && position.y <= -35)  // 下側インゴール
        );

      case '22m':
        return (
          (position.y >= 13 && position.y <= 35) || // 上側22mエリア
          (position.y >= -35 && position.y <= -13)  // 下側22mエリア
        );

      case '10m':
        return (
          Math.abs(position.y) <= 5 // ハーフライン周辺10m
        );

      case 'halfway':
        return Math.abs(position.y) <= 1; // ハーフライン周辺

      default:
        return false;
    }
  };

  /**
   * プレイヤーの初期配置位置を生成
   * @param teamSide - チームサイド（'home' | 'away'）
   * @param playerIndex - プレイヤーインデックス（0-14）
   * @returns 初期配置位置
   */
  const getInitialPlayerPosition = (teamSide: 'home' | 'away', playerIndex: number): LogicalPosition => {
    // 基本フォーメーション（スクラム）の配置
    const formations = {
      home: [
        // フォワード（1-8番）
        { x: -25, y: 15 }, { x: -25, y: 10 }, { x: -30, y: 12.5 }, // フロントロー
        { x: -35, y: 15 }, { x: -35, y: 10 }, // セカンドロー
        { x: -40, y: 17 }, { x: -40, y: 8 }, { x: -40, y: 12.5 }, // バックロー
        // バックス（9-15番）
        { x: -20, y: 12.5 }, // スクラムハーフ
        { x: -10, y: 12.5 }, // スタンドオフ
        { x: 0, y: 20 }, { x: 0, y: 5 }, // センター
        { x: 10, y: 25 }, { x: 10, y: 0 }, // ウィング
        { x: 20, y: 12.5 }, // フルバック
      ],
      away: [
        // フォワード（1-8番）
        { x: 25, y: -15 }, { x: 25, y: -10 }, { x: 30, y: -12.5 }, // フロントロー
        { x: 35, y: -15 }, { x: 35, y: -10 }, // セカンドロー
        { x: 40, y: -17 }, { x: 40, y: -8 }, { x: 40, y: -12.5 }, // バックロー
        // バックス（9-15番）
        { x: 20, y: -12.5 }, // スクラムハーフ
        { x: 10, y: -12.5 }, // スタンドオフ
        { x: 0, y: -20 }, { x: 0, y: -5 }, // センター
        { x: -10, y: -25 }, { x: -10, y: 0 }, // ウィング
        { x: -20, y: -12.5 }, // フルバック
      ],
    };

    const formation = formations[teamSide];
    if (playerIndex >= 0 && playerIndex < formation.length) {
      return formation[playerIndex];
    }

    // フォールバック位置
    const fallbackY = teamSide === 'home' ? 10 : -10;
    return { x: 0, y: fallbackY };
  };

  /**
   * フィールド全体の境界を取得
   * @param includeInGoal - インゴールエリアを含むかどうか
   * @returns フィールド境界
   */
  const getFieldBounds = (includeInGoal = true): FieldBounds => {
    return includeInGoal ? FULL_FIELD_BOUNDS : FIELD_BOUNDS;
  };

  /**
   * 境界近くにいるかチェック
   * @param position - チェックしたい位置
   * @param threshold - 境界からの距離閾値
   * @param includeInGoal - インゴールエリアを含むかどうか
   * @returns 境界近くにいる場合true
   */
  const isNearBoundary = (position: LogicalPosition, threshold = 5, includeInGoal = true): boolean => {
    const bounds = includeInGoal ? FULL_FIELD_BOUNDS : FIELD_BOUNDS;

    return (
      Math.abs(position.x - bounds.minX) < threshold ||
      Math.abs(position.x - bounds.maxX) < threshold ||
      Math.abs(position.y - bounds.minY) < threshold ||
      Math.abs(position.y - bounds.maxY) < threshold
    );
  };

  return {
    FIELD_BOUNDS,
    FULL_FIELD_BOUNDS,
    SAFETY_MARGIN,
    isWithinBounds,
    clampToBounds,
    clampToSafeBounds,
    isWithinArea,
    getInitialPlayerPosition,
    getFieldBounds,
    isNearBoundary,
  };
};
