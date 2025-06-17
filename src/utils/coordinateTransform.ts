import type { LogicalPosition } from '@/composables/useViewport';

/**
 * 旧システムのピクセル座標系
 * 固定サイズフィールド（660x580px）での座標
 */
export interface PixelPosition {
  x: number; // ピクセル座標 (0-660)
  y: number; // ピクセル座標 (0-580)
}

/**
 * 座標変換設定
 */
export interface CoordinateTransformConfig {
  // 旧システムのフィールドサイズ
  oldFieldWidth: number;   // デフォルト: 660px
  oldFieldHeight: number;  // デフォルト: 580px

  // 新システムの論理座標範囲
  logicalWidth: number;    // デフォルト: 120（-60 ~ 60）
  logicalHeight: number;   // デフォルト: 90（-45 ~ 45）
}

/**
 * デフォルトの座標変換設定
 */
const DEFAULT_CONFIG: CoordinateTransformConfig = {
  oldFieldWidth: 660,
  oldFieldHeight: 580,
  logicalWidth: 120,  // ラグビーフィールド幅120m
  logicalHeight: 90,  // ラグビーフィールド長90m（インゴール含む）
};

/**
 * 座標変換ユーティリティクラス
 */
export class CoordinateTransform {
  private config: CoordinateTransformConfig;

  constructor(config: Partial<CoordinateTransformConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 旧ピクセル座標から新論理座標への変換
   * @param pixelPos - 旧システムのピクセル座標
   * @returns 新システムの論理座標
   */
  pixelToLogical(pixelPos: PixelPosition): LogicalPosition {
    // ピクセル座標を0-1の範囲に正規化
    const normalizedX = pixelPos.x / this.config.oldFieldWidth;
    const normalizedY = pixelPos.y / this.config.oldFieldHeight;

    // 論理座標に変換（中心を0,0とする）
    const logicalX = (normalizedX - 0.5) * this.config.logicalWidth;
    const logicalY = (normalizedY - 0.5) * this.config.logicalHeight;

    return { x: logicalX, y: logicalY };
  }

  /**
   * 新論理座標から旧ピクセル座標への変換
   * @param logicalPos - 新システムの論理座標
   * @returns 旧システムのピクセル座標
   */
  logicalToPixel(logicalPos: LogicalPosition): PixelPosition {
    // 論理座標を0-1の範囲に正規化
    const normalizedX = (logicalPos.x / this.config.logicalWidth) + 0.5;
    const normalizedY = (logicalPos.y / this.config.logicalHeight) + 0.5;

    // ピクセル座標に変換
    const pixelX = normalizedX * this.config.oldFieldWidth;
    const pixelY = normalizedY * this.config.oldFieldHeight;

    return { x: pixelX, y: pixelY };
  }

  /**
   * 複数のピクセル座標を一括変換
   * @param pixelPositions - ピクセル座標の配列
   * @returns 論理座標の配列
   */
  convertMultiplePixelToLogical(pixelPositions: PixelPosition[]): LogicalPosition[] {
    return pixelPositions.map(pos => this.pixelToLogical(pos));
  }

  /**
   * 複数の論理座標を一括変換
   * @param logicalPositions - 論理座標の配列
   * @returns ピクセル座標の配列
   */
  convertMultipleLogicalToPixel(logicalPositions: LogicalPosition[]): PixelPosition[] {
    return logicalPositions.map(pos => this.logicalToPixel(pos));
  }

  /**
   * プレイヤーデータの座標変換
   * 既存のプレイヤーデータ構造を維持しながら座標を変換
   */
  convertPlayerData(players: any[][]): any[][] {
    return players.map(team =>
      team.map(player => ({
        ...player,
        logicalX: this.pixelToLogical({ x: player.x, y: player.y }).x,
        logicalY: this.pixelToLogical({ x: player.x, y: player.y }).y,
        // 既存のx, yも保持（後方互換性のため）
      }))
    );
  }

  /**
   * LocalStorageの既存データを論理座標に変換
   * @param storageKey - LocalStorageのキー
   */
  convertStorageData(storageKey: string): void {
    const storedData = localStorage.getItem(storageKey);
    if (!storedData) return;

    try {
      const players = JSON.parse(storedData);
      const convertedPlayers = this.convertPlayerData(players);

      // 変換後のデータを新しいキーで保存
      localStorage.setItem(`${storageKey}_logical`, JSON.stringify(convertedPlayers));

      console.log(`✅ 座標変換完了: ${storageKey} → ${storageKey}_logical`);
    } catch (error) {
      console.error(`❌ 座標変換エラー: ${storageKey}`, error);
    }
  }

  /**
   * フィールド境界の変換
   * 旧システムでの境界を新システムに変換
   */
  getLogicalFieldBounds() {
    return {
      minX: -this.config.logicalWidth / 2,
      maxX: this.config.logicalWidth / 2,
      minY: -this.config.logicalHeight / 2,
      maxY: this.config.logicalHeight / 2,
    };
  }

  /**
   * スケール比率を取得
   * @returns X軸とY軸のスケール比率
   */
  getScaleRatios() {
    return {
      scaleX: this.config.logicalWidth / this.config.oldFieldWidth,
      scaleY: this.config.logicalHeight / this.config.oldFieldHeight,
    };
  }
}

/**
 * デフォルトの座標変換インスタンス
 */
export const defaultCoordinateTransform = new CoordinateTransform();

/**
 * 便利関数：ピクセル座標から論理座標への変換
 */
export const pixelToLogical = (pixelPos: PixelPosition): LogicalPosition => {
  return defaultCoordinateTransform.pixelToLogical(pixelPos);
};

/**
 * 便利関数：論理座標からピクセル座標への変換
 */
export const logicalToPixel = (logicalPos: LogicalPosition): PixelPosition => {
  return defaultCoordinateTransform.logicalToPixel(logicalPos);
};

/**
 * プレイヤーデータの座標システム判定
 * @param player - プレイヤーオブジェクト
 * @returns 論理座標システムを使用している場合true
 */
export const isLogicalCoordinate = (player: any): boolean => {
  return typeof player.logicalX === 'number' && typeof player.logicalY === 'number';
};

/**
 * プレイヤーの現在座標を取得（システムに応じて適切な座標を返す）
 * @param player - プレイヤーオブジェクト
 * @returns 論理座標
 */
export const getPlayerLogicalPosition = (player: any): LogicalPosition => {
  if (isLogicalCoordinate(player)) {
    return { x: player.logicalX, y: player.logicalY };
  }

  // 旧システムのピクセル座標を変換
  return pixelToLogical({ x: player.x || 0, y: player.y || 0 });
};
