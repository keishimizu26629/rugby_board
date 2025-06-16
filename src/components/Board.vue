<template>
  <div id="app">
    <!-- ヘッダー -->
    <header class="app-header">
      <h1 class="app-title">
        Rugby Board
      </h1>
      <UserMenu
        :user-email="authStore.loginUser?.email"
        :user-name="authStore.loginUser?.displayName"
        @logout="logout"
        @profile="handleProfile"
      />
    </header>

    <div id="container">
      <div
        id="board"
        :class="{ 'rectangle-mode': isRectangleMode }"
        @mousedown="handleBoardMouseDown"
        @mousemove="handleBoardMouseMove"
        @mouseup="handleBoardMouseUp"
      >
        <RugbyField
          ref="rugbyField"
          :show-lines="selectedLineBool.value"
          @draw-start="drawStart"
          @draw-move="draw"
          @draw-end="drawEnd"
        />
        <canvas
          id="canvas"
          width="660"
          height="580"
          class="drawing-canvas"
        />

        <!-- マーカー -->
        <div
          v-for="marker in markers"
          :key="marker.index"
          ref="element"
          :style="{left: convertPx(marker.x), top: convertPx(marker.y)}"
          class="marker"
          @mousedown="touchstart($event, marker)"
          @mouseup="touchend()"
        />

        <!-- プレイヤー表示 -->
        <template v-if="selectedNumBool.value">
          <div
            v-for="player in players[0]"
            :key="player.id"
            class="player my-team drawPlayer"
          >
            {{ player.number }}
          </div>
          <div
            v-for="player in players[1]"
            :key="player.id"
            class="player opponent drawPlayer"
          >
            {{ player.number }}
          </div>
        </template>
        <template v-else>
          <div
            v-for="player in players[0]"
            :key="player.id"
            class="player my-team drawPlayer"
          />
          <div
            v-for="player in players[1]"
            :key="player.id"
            class="player opponent drawPlayer"
          />
        </template>

        <!-- ポイントマーカー -->
        <div class="player points drawPlayer">
          S
        </div>
        <div class="player points drawPlayer">
          R
        </div>
        <div class="player points drawPlayer">
          M
        </div>
        <div class="player points drawPlayer line-out">
          L
        </div>

        <!-- ボール -->
        <img
          src="/ball.png"
          class="player ball drawPlayer"
        >

        <!-- 矩形選択可視化 -->
        <div
          v-if="rectangleSelection.isActive"
          class="selection-rectangle"
          :style="{
            left: selectionRectangle.x + 'px',
            top: selectionRectangle.y + 'px',
            width: selectionRectangle.width + 'px',
            height: selectionRectangle.height + 'px',
          }"
        />
      </div>

      <!-- コントロールパネル -->
      <ControlPanel
        :board-settings="boardSettings"
        :line-settings="lineSettings"
        :positions="positions"
        :selected-position="selectPosition"
        :is-loading="isLoading"
        :is-rectangle-mode="isRectangleMode"
        @update-board-settings="updateBoardSettings"
        @update-line-settings="updateLineSettings"
        @add-marker="addSpot"
        @remove-marker="removeMarker"
        @clear-players="clearPlayer"
        @clear-drawing="cleardrawPath"
        @save-position="openModal"
        @apply-position="applyPosition"
        @delete-position="deletePosition"
        @set-selection-mode="handleSetSelectionMode"
      />
    </div>

    <!-- ポジション保存モーダル -->
    <section
      v-if="modal"
      id="sendModal"
      class="modal"
    >
      <div class="modalBody">
        <p>配置の名前を入力してください。</p>
        <input
          v-model="inputPosition"
          type="text"
        >
        <div id="sendError" />
      </div>
      <div class="modalFootter">
        <div
          class="register"
          @click="testPost"
        >
          登録
        </div>
      </div>
    </section>
    <div
      v-if="modal"
      id="mask"
      @click="closeModal"
    />
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import ControlPanel from '@/components/molecules/ControlPanel.vue';
import RugbyField from '@/components/molecules/RugbyField.vue';
import UserMenu from '@/components/molecules/UserMenu.vue';

export default {
  name: 'RugbyBoard',
  components: {
    ControlPanel,
    RugbyField,
    UserMenu
  },
  setup() {
    const authStore = useAuthStore();
    return {
      authStore
    };
  },
  data() {
    return {
      // プレイヤー関連データ
      players: [], // プレイヤー配置情報の配列（チーム別）
      teams: [     // チーム情報（CSSクラス名に対応）
        {name: 'my-team'},    // 自チーム（赤色）
        {name: 'opponent'},   // 相手チーム（黒色）
        {name: 'ball'},       // ボール
        {name: 'points'},     // ポイントマーカー
      ],
      selectedPlayers: [], // 選択されたプレイヤーの配列

      // 複数選択機能の状態管理
      isCtrlPressed: false,   // Ctrlキーの押下状態
      isMetaPressed: false,   // Metaキーの押下状態
      selectionCounter: 0,    // 選択順序カウンター
      initialPositions: {},   // ドラッグ開始時の選択プレイヤーの初期位置

      // 描画関連データ
      gX: 0,              // 描画開始X座標
      gY: 0,              // 描画開始Y座標
      canvas: null,       // 描画用キャンバス要素
      context: null,      // キャンバスの2Dコンテキスト
      isDraw: false,      // 描画中フラグ
      drawPath: [],       // 描画パス（未使用）
      drawPath2: [],      // 描画パス2（未使用）

      // UI状態管理
      selectPosition: '', // 選択されたポジション名
      inputPosition: '',  // 入力されたポジション名
      modal: false,       // モーダル表示フラグ
      isLoading: false,   // ローディング状態フラグ

      // ドラッグ＆ドロップ関連
      isMove: false,      // 移動中フラグ
      shiftX: 0,          // マウスとオブジェクトのX方向オフセット
      shiftY: 0,          // マウスとオブジェクトのY方向オフセット

      // 選択モード管理
      currentSelectionMode: 'normal', // 'normal' | 'rectangle'

      // 矩形選択状態
      rectangleSelection: {
        isActive: false,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0
      },

      // その他
      count: 0,           // カウンター（未使用）
      testPositions: [], // テストポジション配列（未使用）

      // ボード表示設定
      boardSettings: {
        showLines: true,    // ライン表示フラグ
        showNumbers: true   // 背番号表示フラグ
      },

      // 描画線の設定
      lineSettings: {
        color: 'white',     // 線の色
        width: 4            // 線の太さ
      },

      // 旧形式の設定（後方互換性のため保持）
      selectedColor: { label: '白', value: 'white' }, // 選択された色
      colors: [ // 利用可能な色の選択肢
        { label: '白', value: 'white' },
        { label: '黒', value: 'black' },
        { label: '赤', value: 'red' },
        { label: '青', value: 'blue' },
        { label: '黄', value: 'yellow' },
        { label: '消しゴム', value: 'transparent' },
      ],
      selectedLineWidth: { label: '4px', value: 4 }, // 選択された線の太さ
      lineWidths: [ // 利用可能な線の太さの選択肢
        { label: '細', value: 2 },
        { label: '中', value: 4 },
        { label: '太', value: 6 },
      ],
      selectedNumBool: { label: 'あり', value: true }, // 背番号表示設定
      numBool: [ // 背番号表示の選択肢
        { label: 'あり', value: true},
        { label: 'なし', value: false},
      ],
      selectedLineBool: { label: 'あり', value: true }, // ライン表示設定
      lineBool: [ // ライン表示の選択肢
        { label: 'あり', value: true},
        { label: 'なし', value: false},
      ],

      // マーカー関連
      markers: [],        // 配置されたマーカーの配列
      obj_marker: {       // マーカーのデフォルト設定
        x: 100,           // 初期X座標
        y: 100,           // 初期Y座標
        index: 0,         // マーカーのインデックス
      },

      // マウス・タッチイベント用変数
      ePageX: null,       // マウスX座標（未使用）
      ePageY: null,       // マウスY座標（未使用）
      moveMarker: null,   // 移動中のマーカー参照
    }
  },
  computed: {
    /**
     * ストアから保存済みポジションデータを取得
     * @returns {Array} 保存されたポジション設定の配列
     */
    positions() {
      return this.authStore.positions;
    },

    /**
     * ログイン中ユーザーのUIDを取得
     * @returns {string|undefined} ユーザーID
     */
    uid() {
      return this.authStore.loginUser?.uid;
    },

    /**
     * 数値をpx単位の文字列に変換するヘルパー関数
     * テンプレート内でスタイル設定に使用
     * @returns {Function} 変換関数
     */
    convertPx() {
      return (num) => {
        return num + 'px'
      }
    },

    /**
     * 矩形選択モードかどうか
     * @returns {boolean} 矩形選択モードの場合true
     */
    isRectangleMode() {
      return this.currentSelectionMode === 'rectangle';
    },

    /**
     * 選択矩形の表示情報
     * @returns {Object} 矩形の位置とサイズ情報
     */
    selectionRectangle() {
      const { startX, startY, endX, endY } = this.rectangleSelection;
      return {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY)
      };
    },
  },
  watch: {
    /**
     * ログインユーザーの変更を監視
     * ユーザーがログインした際に保存済みポジションデータを取得
     */
    'authStore.loginUser': {
      handler(newUser) {
        if (newUser) {
          // ユーザーがログインしたらデータを取得
          this.authStore.fetchData();
        }
      },
      immediate: true // コンポーネント作成時にも実行
    }
  },
  /**
   * コンポーネント作成時の初期化処理
   * プレイヤーの初期配置を作成
   */
  created() {
    this.createPlayers();
  },

  /**
   * DOMマウント後の初期化処理
   * キャンバスの設定、イベントリスナーの登録、既存データの復元を行う
   */
  mounted() {
    // 描画用キャンバスの初期化
    this.canvas = document.querySelector('#canvas')
    this.context = this.canvas.getContext('2d')

    // グローバルイベントリスナーの登録
    window.addEventListener('mousemove', this.moveAtMarker);    // マーカー移動用
    window.addEventListener('resize', this.syncCanvasPosition); // 画面リサイズ対応

    // 描画イベントはRugbyFieldから受け取るため、直接のイベントリスナーは不要

    // LocalStorageからプレイヤー配置を復元
    this.placement();
    // LocalStorageから描画内容を復元
    this.drawAgain(this.context);

    // 初期化時に登録済みのポジションデータを取得
    if (this.authStore.loginUser) {
      this.authStore.fetchData();
    }

    // キーイベントリスナーを追加（複数選択機能用）
    const handleKeyDown = (event) => {
      // 修飾キー状態を更新
      if (event.key === 'Control') {
        this.isCtrlPressed = true;
      }
      if (event.key === 'Meta' || event.key === 'Cmd') {
        this.isMetaPressed = true;
      }
    };

    const handleKeyUp = (event) => {
      // 修飾キー状態を解除
      if (event.key === 'Control') {
        this.isCtrlPressed = false;
      }
      if (event.key === 'Meta' || event.key === 'Cmd') {
        this.isMetaPressed = false;
      }
    };

    // windowにキーイベントリスナーを追加
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    // クリーンアップ用に保存
    this._boardKeyListeners = { handleKeyDown, handleKeyUp };

    // 空白クリックで選択解除
    document.getElementById("board").addEventListener("click", (event) => {
      // ボードの背景がクリックされた場合のみ選択解除
      if (event.target.id === "board") {
        this.clearSelection();
      }
    });

    // DOM更新完了後にプレイヤーの配置とドラッグイベントを設定
    this.$nextTick(() => {
      this.initializePlayerDragEvents(); // ドラッグ&ドロップ機能の初期化
      this.syncCanvasPosition();         // キャンバス位置の同期
    });
  },
  /**
   * コンポーネント破棄前のクリーンアップ処理
   * イベントリスナーを削除してメモリリークを防ぐ
   */
  beforeUnmount() {
    window.removeEventListener('mousemove', this.moveAtMarker);
    window.removeEventListener('resize', this.syncCanvasPosition);

    // キーイベントリスナーをクリーンアップ
    if (this._boardKeyListeners) {
      window.removeEventListener('keydown', this._boardKeyListeners.handleKeyDown, true);
      window.removeEventListener('keyup', this._boardKeyListeners.handleKeyUp, true);
      delete this._boardKeyListeners;
    }
  },

  methods: {
    /**
     * 選択モード切り替えハンドラー
     * @param {string} mode - 選択モード（'normal' | 'rectangle'）
     */
    handleSetSelectionMode(mode) {
      console.log('🔄 Selection mode changing to:', mode);
      this.currentSelectionMode = mode;

      if (mode === 'rectangle') {
        // 矩形選択モードでは既存選択をクリア
        this.clearSelection();
      }
    },

    /**
     * 矩形選択開始
     * @param {MouseEvent} event - マウスイベント
     */
    startRectangleSelection(event) {
      if (!this.isRectangleMode) return;

      const rect = event.currentTarget.getBoundingClientRect();
      this.rectangleSelection = {
        isActive: true,
        startX: event.clientX - rect.left,
        startY: event.clientY - rect.top,
        endX: event.clientX - rect.left,
        endY: event.clientY - rect.top
      };
    },

    /**
     * 矩形選択更新
     * @param {MouseEvent} event - マウスイベント
     */
    updateRectangleSelection(event) {
      if (!this.rectangleSelection.isActive) return;

      const rect = event.currentTarget.getBoundingClientRect();
      this.rectangleSelection.endX = event.clientX - rect.left;
      this.rectangleSelection.endY = event.clientY - rect.top;
    },

    /**
     * 矩形選択完了
     */
    completeRectangleSelection() {
      if (!this.rectangleSelection.isActive) return;

      console.log('🔍 矩形選択完了デバッグ情報:');
      console.log('矩形情報:', this.selectionRectangle);
      console.log('プレイヤーデータ:', this.players);

      // 既存選択をクリア
      this.clearSelection();

      let selectedCount = 0;

      // 矩形内のプレイヤーを選択（実際のDOM座標を使用）
      this.players.forEach((team, teamIndex) => {
        team.forEach((player, playerIndex) => {
          // 実際のDOM座標を取得
          const realPos = this.getPlayerRealPosition(teamIndex, playerIndex);

          console.log(`プレイヤー [${teamIndex}][${playerIndex}]:`, {
            dataX: player.x,
            dataY: player.y,
            realX: realPos?.x,
            realY: realPos?.y,
            number: player.number,
            inRectangleData: this.isPlayerInRectangle(player.x, player.y),
            inRectangleReal: realPos ? this.isPlayerInRectangle(realPos.x, realPos.y) : false
          });

          // 実際のDOM座標で判定
          if (realPos && this.isPlayerInRectangle(realPos.x, realPos.y)) {
            selectedCount++;
            const playerId = `${teamIndex}_${playerIndex}`;
            console.log(`✅ 選択対象: ${playerId}`);
            this.handlePlayerSelection(playerId, teamIndex, playerIndex, true);
          }
        });
      });

      console.log(`📊 選択されたプレイヤー数: ${selectedCount}`);
      this.rectangleSelection.isActive = false;
    },

    /**
     * DOM要素から実際の座標を取得
     * @param {number} teamIndex - チームインデックス
     * @param {number} playerIndex - プレイヤーインデックス
     * @returns {Object|null} 実際の座標情報、または要素が見つからない場合null
     */
    getPlayerRealPosition(teamIndex, playerIndex) {
      const teamClass = this.teams[teamIndex]?.name;
      if (!teamClass) return null;

      const players = document.getElementsByClassName(teamClass);
      const player = players[playerIndex];

      if (!player) return null;

      const boardRect = document.getElementById('board').getBoundingClientRect();
      const playerRect = player.getBoundingClientRect();

      return {
        x: playerRect.left - boardRect.left + (playerRect.width / 2),
        y: playerRect.top - boardRect.top + (playerRect.height / 2)
      };
    },

    /**
     * プレイヤーが矩形内にあるかチェック
     * @param {number} playerX - プレイヤーのX座標
     * @param {number} playerY - プレイヤーのY座標
     * @returns {boolean} 矩形内にある場合true
     */
    isPlayerInRectangle(playerX, playerY) {
      const rect = this.selectionRectangle;
      return (
        playerX >= rect.x &&
        playerX <= rect.x + rect.width &&
        playerY >= rect.y &&
        playerY <= rect.y + rect.height
      );
    },

    /**
     * ボードマウスダウンイベント
     * @param {MouseEvent} event - マウスイベント
     */
    handleBoardMouseDown(event) {
      if (this.isRectangleMode) {
        event.preventDefault();
        this.startRectangleSelection(event);
      }
    },

    /**
     * ボードマウスムーブイベント
     * @param {MouseEvent} event - マウスイベント
     */
    handleBoardMouseMove(event) {
      if (this.isRectangleMode) {
        this.updateRectangleSelection(event);
      }
    },

    /**
     * ボードマウスアップイベント
     * @param {MouseEvent} event - マウスイベント
     */
    handleBoardMouseUp(event) {
      if (this.isRectangleMode) {
        this.completeRectangleSelection();
      }
    },

    /**
     * ボードの設定を更新
     * ライン表示、背番号表示の切り替えを管理
     * @param {string} setting - 設定項目名（'showLines' | 'showNumbers'）
     * @param {boolean} value - 設定値
     */
    updateBoardSettings(setting, value) {
      this.boardSettings[setting] = value;

      if (setting === 'showNumbers') {
        // 背番号表示設定を古い形式にも反映（後方互換性）
        this.selectedNumBool.value = value;
        // 背番号表示切り替え時にプレイヤーのドラッグイベントを再初期化
        // DOM更新後に処理することで正しく動作する
        this.$nextTick(() => {
          this.initializePlayerDragEvents();
        });
      }

      if (setting === 'showLines') {
        // ライン表示設定を古い形式にも反映（後方互換性）
        this.selectedLineBool.value = value;
      }
    },

    /**
     * 描画設定を更新
     * 線の色や太さの設定を管理し、新旧両形式に対応
     * @param {Object} settings - 設定オブジェクト（color, width等）
     */
    updateLineSettings(settings) {
      // 新しい形式の設定をマージ
      this.lineSettings = { ...this.lineSettings, ...settings };

      // 古い形式の設定も更新（後方互換性のため）
      if (settings.color) {
        // 色設定のマッピング
        const colorMap = {
          'white': { label: '白', value: 'white' },
          'black': { label: '黒', value: 'black' },
          'red': { label: '赤', value: 'red' },
          'blue': { label: '青', value: 'blue' },
          'yellow': { label: '黄', value: 'yellow' },
          'transparent': { label: '消しゴム', value: 'transparent' }
        };
        this.selectedColor = colorMap[settings.color] || this.selectedColor;
      }

      if (settings.width) {
        // 線の太さ設定のマッピング
        const widthMap = {
          2: { label: '細', value: 2 },
          4: { label: '中', value: 4 },
          6: { label: '太', value: 6 }
        };
        this.selectedLineWidth = widthMap[settings.width] || this.selectedLineWidth;
      }
    },

    /**
     * 保存されたポジションを適用
     * 指定されたポジション名の配置を現在のボードに反映
     * @param {string} positionName - 適用するポジション名
     */
    applyPosition(positionName) {
      this.selectPosition = positionName; // 選択されたポジション名を保存
      this.customPlacement(this.positions); // ポジションデータから配置を復元
    },

    /**
     * 描画キャンバスの位置をRugbyFieldと同期
     * ウィンドウリサイズ時やレイアウト変更時に呼び出される
     * RugbyFieldキャンバスと描画キャンバスの位置・サイズを一致させる
     */
    syncCanvasPosition() {
      const rugbyField = this.$refs.rugbyField.$refs.fieldCanvas; // ラグビーフィールドキャンバス
      const canvas = this.canvas; // 描画用キャンバス

      if (rugbyField && canvas) {
        // 各キャンバスの画面内位置を取得
        const rugbyRect = rugbyField.getBoundingClientRect();
        const boardRect = document.getElementById('board').getBoundingClientRect();

        // RugbyFieldのボードコンテナ内での相対位置を計算
        const relativeLeft = rugbyRect.left - boardRect.left;
        const relativeTop = rugbyRect.top - boardRect.top;

        // 描画キャンバスをRugbyFieldと同じ位置・サイズに配置
        canvas.style.left = relativeLeft + 'px';
        canvas.style.top = relativeTop + 'px';
        canvas.style.width = rugbyRect.width + 'px';
        canvas.style.height = rugbyRect.height + 'px';
      }
    },

    /**
     * プレイヤーのドラッグイベントを初期化
     * 各プレイヤー要素にドラッグ&ドロップ機能を設定
     * 背番号表示切り替え時やページ読み込み時に呼び出される
     */
    initializePlayerDragEvents() {
      let teams = this.teams; // チーム情報の配列

      // 各チーム（my-team, opponent, ball, points）を処理
      teams.forEach((team, i) => {
        // チーム名（CSSクラス）に対応するDOM要素を取得
        let players = [...document.getElementsByClassName(team.name)];

        // 各プレイヤー要素を処理
        players.forEach((player, index) => {
          // プレイヤーデータが存在するかチェック
          if (this.players[i] && this.players[i][index]) {
            // 既存のイベントリスナーをクリーンアップ（重複登録防止）
            if (player._mousedownHandler) {
              player.removeEventListener('mousedown', player._mousedownHandler);
            }

            // プレイヤーの初期位置とスタイルを設定
            player.style.position = 'absolute';
            player.style.left = this.players[i][index].x + 'px';
            player.style.top = this.players[i][index].y + 'px';
            player.style.zIndex = this.players[i][index].zIndex;

            // マウスダウンイベントハンドラーを作成
            const mousedownHandler = (event) => {
              event.preventDefault(); // デフォルトのドラッグ動作を無効化

              // 修飾キーの状態を確認（複数選択判定）
              const isMultiSelect =
                this.isCtrlPressed || this.isMetaPressed || event.ctrlKey || event.metaKey;

              // プレイヤーIDを生成（teamIndex_playerIndex形式）
              const playerId = `${i}_${index}`;



              // 選択処理を実行
              this.handlePlayerSelection(playerId, i, index, isMultiSelect);

              // 複数選択のドラッグ開始処理
              this.startMultiDrag(playerId);

              this.isMove = true; // 移動中フラグを設定

              // 座標計算のため各要素の位置を取得
              const boardRect = document.getElementById('board').getBoundingClientRect(); // ボードコンテナ
              const playerRect = player.getBoundingClientRect(); // プレイヤー要素

              // マウスとプレイヤーの相対位置を計算（ドラッグ時のオフセット）
              let shiftX = event.clientX - playerRect.left;
              let shiftY = event.clientY - playerRect.top;

              // ドラッグ開始時にプレイヤーを最前面に移動
              this.setZIndex(players, i, index);

              // プレイヤー移動処理の内部関数
              const moveAt = (clientX, clientY) => {
                // ボードコンテナ内での相対位置を計算
                const newX = clientX - boardRect.left - shiftX;
                const newY = clientY - boardRect.top - shiftY;

                // 複数選択時は同時移動、単一選択時は通常移動
                if (this.selectedPlayers.length > 1) {
                  // 複数選択プレイヤーの同時移動
                  this.moveSelectedPlayers(playerId, newX, newY);
                } else {
                  // 単一プレイヤーの移動
                  player.style.left = newX + 'px';
                  player.style.top = newY + 'px';
                }
              };

              // マウス移動時のイベントハンドラー
              const onMouseMove = (event) => {
                moveAt(event.clientX, event.clientY);
              };

              // 初期位置を設定（ドラッグ開始直後）
              moveAt(event.clientX, event.clientY);
              // グローバルマウス移動イベントを登録
              document.addEventListener('mousemove', onMouseMove);

              // マウスアップ時のイベントハンドラー
              const onMouseUp = (e) => {
                this.isMove = false; // 移動中フラグを解除
                // イベントリスナーをクリーンアップ
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                // 最終位置を計算してデータに保存
                const finalX = e.clientX - boardRect.left - shiftX;
                const finalY = e.clientY - boardRect.top - shiftY;

                if (this.selectedPlayers.length > 1) {
                  // 複数選択時：最終的な全プレイヤーの位置をLocalStorageに保存
                  this.selectedPlayers.forEach(selectedPlayer => {
                    const { teamIndex, playerIndex } = this.findPlayerIndices(selectedPlayer.id);
                    if (teamIndex !== -1 && playerIndex !== -1 && this.players[teamIndex] && this.players[teamIndex][playerIndex]) {
                      // 既にmoveSelectedPlayersで更新済みなので、LocalStorageに保存
                      localStorage.setItem('players', JSON.stringify(this.players));
                    }
                  });

                } else {
                  // 単一プレイヤーの位置保存
                  this.measuresReload(finalX, finalY, i, index);
                }
              };

              // グローバルマウスアップイベントを登録
              document.addEventListener('mouseup', onMouseUp);
            };

            // イベントハンドラーの参照を保存（後でクリーンアップするため）
            player._mousedownHandler = mousedownHandler;
            // プレイヤー要素にマウスダウンイベントを登録
            player.addEventListener('mousedown', mousedownHandler);

            // ブラウザデフォルトのドラッグ機能を無効化
            player.ondragstart = function() {
              return false;
            };
          }
        });
      });
    },

    /**
     * キャンバス上の正確な座標を取得
     * マウスイベントの画面座標をキャンバス内座標に変換
     * スケールファクターを考慮して正確な描画位置を計算
     * @param {MouseEvent} event - マウスイベント
     * @returns {Object} キャンバス内のx, y座標
     */
    getCanvasCoordinates(event) {
      const canvas = this.canvas; // 描画用キャンバス
      const rugbyField = this.$refs.rugbyField.$refs.fieldCanvas; // ラグビーフィールドキャンバス

      // RugbyFieldキャンバスの画面内位置を取得
      const rect = rugbyField.getBoundingClientRect();

      // キャンバスの実際のサイズと表示サイズの比率を計算（スケールファクター）
      const scaleX = canvas.width / rect.width;   // X方向のスケール
      const scaleY = canvas.height / rect.height; // Y方向のスケール

      // マウス座標をキャンバス内座標に変換
      return {
        x: (event.clientX - rect.left) * scaleX, // X座標変換
        y: (event.clientY - rect.top) * scaleY   // Y座標変換
      };
    },

    /**
     * 描画機能（線の描画処理）
     * マウス移動中に呼び出されて線を描画する
     * 消しゴム機能も含む
     * @param {MouseEvent} e - マウスイベント
     */
    draw(e) {
      // 描画中でなければ処理を終了
      if(!this.isDraw) {
        return;
      }

      // マウス座標をキャンバス内座標に変換
      const coords = this.getCanvasCoordinates(e);
      const x = coords.x;
      const y = coords.y;

      // 描画設定を適用
      this.context.lineWidth = this.selectedLineWidth.value;   // 線の太さ
      this.context.strokeStyle = this.selectedColor.value;     // 線の色

      // 消しゴム機能の処理
      if (this.selectedColor.value == 'transparent') {
        // 消しゴムモード：既存の描画を消去
        this.context.globalCompositeOperation = 'destination-out';
        this.context.lineWidth = this.selectedLineWidth.value * 3; // 消しゴムは太めに
        this.context.strokeStyle = 'white'
      } else {
        // 通常の描画モード
        this.context.globalCompositeOperation = 'source-over';
      }

      // 線の描画設定
      this.context.lineCap = 'round';    // 線の端を丸く
      this.context.lineJoin = 'round';   // 線の継ぎ目を丸く

      // 前の位置から現在位置まで線を描画
      this.context.beginPath();
      this.context.moveTo(this.gX, this.gY); // 開始点（前の位置）
      this.context.lineTo(x, y);              // 終了点（現在位置）
      this.context.stroke();

      // 次の描画のために現在位置を保存
      this.gX = x;
      this.gY = y;
    },

    /**
     * 描画開始処理
     * マウスダウン時に呼び出される
     * @param {MouseEvent} e - マウスイベント
     */
    drawStart(e) {
      // 矩形選択モード時は描画を無効化
      if (this.isRectangleMode) {
        return;
      }

      // 描画モード中はプレイヤーのドラッグを無効化
      let players = [...document.getElementsByClassName('player')];
      players.forEach(player => {
        player.classList.remove('drawPlayer'); // ドラッグ可能クラスを削除
      });

      // プレイヤー移動中は描画を開始しない
      if(this.isMove) {
        return;
      }

      // 描画開始フラグを設定
      this.isDraw = true;

      // 描画開始位置を記録
      const coords = this.getCanvasCoordinates(e);
      this.gX = coords.x;
      this.gY = coords.y;
    },

    /**
     * 描画終了処理
     * マウスアップ時に呼び出される
     * 描画内容をLocalStorageに保存
     */
    drawEnd() {
      // 描画パスを閉じる
      this.context.closePath();
      // 描画終了フラグを設定
      this.isDraw = false;

      // プレイヤーのドラッグ機能を再有効化
      let players = [...document.getElementsByClassName('player')];
      players.forEach(player => {
        player.classList.add('drawPlayer'); // ドラッグ可能クラスを復元
      });

      // 描画内容をLocalStorageに保存（リロード時の復元用）
      const canvas = this.canvas;
      let data = canvas.toDataURL(); // キャンバスをBase64データに変換
      localStorage.setItem('drawPath', data);
    },

    /**
     * ログアウト
     */
    logout() {
      this.authStore.logout();
    },

    /**
     * プロフィール設定の処理
     */
    handleProfile() {
      // 将来的にプロフィール設定画面への遷移などを実装

    },

    /**
     * プレイヤー配置オブジェクトに変換
     */
    transformObject() {
      const position = {};
      const players = this.players;
      for (let i = 0; i < players.length; i++) {
        let clone_players = {};
        players[i].forEach(player => {
          clone_players[player.number] = player;
        })
        position[i] = clone_players;
      }
      return position;
    },

    /**
     * ポジションを保存
     */
    testPost() {
      const position = this.transformObject();
      this.isLoading = true;
      this.authStore.testPost({name: this.inputPosition, players: position})
        .then(() => {
          this.closeModal();
        })
        .catch((error) => {
          console.error('Position save failed:', error);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    /**
     * カスタム配置を適用
     */
    customPlacement(positions) {
      if (this.selectPosition != '') {
        const testPositions = positions.slice();
        this.players = [];
        testPositions.forEach((position) => {
          if (position.name == this.selectPosition) {
            const newPosition = Object.values(position.position);
            newPosition.forEach(players => {
              const clonePlayers = [];
              Object.values(players).forEach(player => {
                const clonePlayer = {
                  number: player.number,
                  x: player.x,
                  y: player.y,
                  zIndex: player.zIndex,
                }
                clonePlayers.push(clonePlayer);
              });
              this.players.push(clonePlayers);
            });
            this.rellocation();
          }
        });
      }
    },

    /**
     * プレイヤーを再配置
     * データに基づいてDOM要素の位置を更新
     * ポジション適用時やプレイヤークリア時に呼び出される
     */
    rellocation() {
      let teams = this.teams; // チーム情報の配列

      // 各チームのプレイヤーを処理
      teams.forEach((team, i) => {
        // チーム名に対応するDOM要素を取得
        let players = [...document.getElementsByClassName(team.name)];

        // 各プレイヤーの位置を更新
        players.forEach((player, index) => {
          if (this.players[i] && this.players[i][index]) {
            // プレイヤーデータに基づいて位置とスタイルを設定
            player.style.position = 'absolute';
            player.style.left = this.players[i][index].x + 'px';   // X座標
            player.style.top = this.players[i][index].y + 'px';    // Y座標
            player.style.zIndex = this.players[i][index].zIndex;   // 重ね順
          }
        });
      });

      // 更新されたプレイヤー配置をLocalStorageに保存
      localStorage.setItem('players', JSON.stringify(this.players));

      // DOM更新完了後にドラッグイベントを再初期化
      this.$nextTick(() => {
        this.initializePlayerDragEvents();
      });
    },

    /**
     * プレイヤー位置をリロード時に保存
     * ドラッグ&ドロップでプレイヤーを移動した際に位置を保存
     * @param {number} left - 新しいX座標
     * @param {number} top - 新しいY座標
     * @param {number} i - チームインデックス（0:自チーム, 1:相手チーム, 2:ボール, 3:ポイント）
     * @param {number} index - プレイヤーインデックス
     */
    measuresReload(left, top, i, index) {
      // プレイヤー配置データを更新
      this.players[i][index].x = left;
      this.players[i][index].y = top;
      // LocalStorageに保存（ページリロード時の復元用）
      localStorage.setItem('players', JSON.stringify(this.players));
    },

    /**
     * 描画を再描画
     * LocalStorageに保存された描画データを復元
     * ページリロード時に前回の描画内容を復元するために使用
     * @param {CanvasRenderingContext2D} ctx - キャンバスの2Dコンテキスト
     */
    drawAgain(ctx) {
      let data = localStorage.getItem('drawPath') // 保存された描画データを取得
      if (data) {
        // Base64画像データからImageオブジェクトを作成
        let img = new Image();
        img.src = data;
        // 画像読み込み完了後にキャンバスに描画
        img.onload = function(){
          ctx.drawImage(img, 0, 0, 660, 580);
        }
      }
    },

    /**
     * 描画をクリア
     * 描画内容とLocalStorageの保存データを全て削除
     */
    cleardrawPath() {
      localStorage.removeItem('drawPath'); // LocalStorageの描画データを削除
      this.drawPath = [];                  // 描画パス配列をクリア（未使用）
      this.drawPath2 = [];                 // 描画パス配列2をクリア（未使用）
      this.resetDrawPath();                // キャンバスをクリア
    },

    /**
     * キャンバスをリセット
     * 描画内容を物理的に消去
     */
    resetDrawPath() {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 660, 580); // キャンバス全体をクリア
    },

    /**
     * Z-Index（重ね順）を管理
     * ドラッグ開始時に選択されたプレイヤーを最前面に移動
     * 他のプレイヤーのZ-Indexを調整してレイヤー順序を管理
     * @param {HTMLElement[]} players - プレイヤー要素の配列
     * @param {number} i - チームインデックス
     * @param {number} index - プレイヤーインデックス
     */
    setZIndex(players, i, index) {
      let playersAll = document.getElementsByClassName('player'); // 全プレイヤー要素を取得
      let targetNumber = Number(players[index].style.zIndex);     // 対象プレイヤーの現在のZ-Index

      // 対象プレイヤーより上にあるプレイヤーのZ-Indexを下げる
      for (let j = 0; j < playersAll.length; j++) {
        if (targetNumber < Number(playersAll[j].style.zIndex)) {
          playersAll[j].style.zIndex = playersAll[j].style.zIndex - 10; // 10下げる
          this.players[i][index].zIndex = playersAll[j].style.zIndex;   // データも更新
        }
      }

      // 対象プレイヤーを最前面（350）に設定
      players[index].style.zIndex = 350;
    },

    /**
     * プレイヤーをクリア
     * 全プレイヤーを初期位置にリセット
     * 保存されたポジションデータも削除
     */
    clearPlayer() {
      this.players = [];               // プレイヤーデータをクリア
      this.createPlayers();            // 初期配置でプレイヤーを再作成
      this.rellocation();              // DOM要素の位置を更新
      localStorage.removeItem('players'); // LocalStorageの保存データを削除
    },

    /**
     * モーダルを閉じる
     */
    closeModal() {
      this.modal = false;
      this.inputPosition = '';
    },

    /**
     * モーダルを開く
     */
    openModal() {
      this.modal = true;
    },

    /**
     * ポジションを削除
     */
    deletePosition(name) {
      if (confirm('削除しますか？')) {
        this.isLoading = true;
        this.authStore.testDelete(name)
          .finally(() => {
            this.isLoading = false;
          });
      }
    },

    /**
     * マーカーを追加
     */
    addSpot() {
      this.markers.push(Object.assign({}, this.obj_marker));
      let markers_length = this.markers.length;
      this.markers[markers_length-1].x += (10 * markers_length);
      this.markers[markers_length-1].y += (10 * markers_length);
      this.markers[markers_length-1].index = markers_length-1;
    },

    /**
     * マーカーを削除
     */
    removeMarker() {
      this.markers.pop();
    },

    /**
     * マーカーのタッチ開始
     */
    touchstart(event, marker) {
      event.preventDefault();
      this.isMove = true;
      this.moveMarker = marker;
      if (!this.moveMarker) {
        console.error('Marker is null or undefined');
      }

      // ボードコンテナの位置を取得
      const boardRect = document.getElementById('board').getBoundingClientRect();
      const markerRect = this.$refs.element[marker.index].getBoundingClientRect();

      // マウスとマーカーの相対位置を計算
      this.shiftX = event.clientX - markerRect.left;
      this.shiftY = event.clientY - markerRect.top;
    },

    /**
     * マーカーの移動
     */
    moveAtMarker(event) {
      if(!this.isMove || !this.moveMarker) {
        return
      }

      // ボードコンテナの位置を取得
      const boardRect = document.getElementById('board').getBoundingClientRect();

      // ボードコンテナ内での相対位置を計算
      this.moveMarker.x = event.clientX - boardRect.left - this.shiftX;
      this.moveMarker.y = event.clientY - boardRect.top - this.shiftY;
    },

    /**
     * タッチ終了
     */
    touchend() {
      this.isMove = false;
      if (this.moveMarker) {
        this.moveMarker = null;
      }
    },

    // ===== 複数選択機能のメソッド =====

    /**
     * プレイヤー選択処理
     * @param {string} playerId - プレイヤーID
     * @param {number} teamIndex - チームインデックス
     * @param {number} playerIndex - プレイヤーインデックス
     * @param {boolean} isMultiSelect - 複数選択モードかどうか
     */
    handlePlayerSelection(playerId, teamIndex, playerIndex, isMultiSelect) {
      console.log('🎯 プレイヤー選択処理:', {
        playerId,
        teamIndex,
        playerIndex,
        isMultiSelect,
        playerExists: !!(this.players[teamIndex] && this.players[teamIndex][playerIndex])
      });

      if (!isMultiSelect) {
        // 単一選択時：既存の選択はクリアせず、新しいプレイヤーを追加選択
        this.selectPlayer(playerId, teamIndex, playerIndex);
      } else {
        // 複数選択：トグル動作
        this.togglePlayerSelection(playerId, teamIndex, playerIndex);
      }

      // 選択状態の視覚的更新
      this.updatePlayerVisualSelection();
    },

    /**
     * プレイヤーを選択状態にする
     */
    selectPlayer(playerId, teamIndex, playerIndex) {
      // 既に選択されているかチェック
      const existingIndex = this.selectedPlayers.findIndex(p => p.id === playerId);
      console.log('🔘 selectPlayer:', { playerId, existingIndex, beforeCount: this.selectedPlayers.length });

      if (existingIndex === -1) {
        this.selectionCounter++;
        this.selectedPlayers.push({
          id: playerId,
          teamIndex,
          playerIndex,
          order: this.selectionCounter
        });
        console.log('✅ プレイヤー追加:', { playerId, afterCount: this.selectedPlayers.length });
      } else {
        console.log('⚠️ プレイヤー既に選択済み:', playerId);
      }
    },

    /**
     * プレイヤーの選択状態をトグル
     */
    togglePlayerSelection(playerId, teamIndex, playerIndex) {
      const existingIndex = this.selectedPlayers.findIndex(p => p.id === playerId);

      if (existingIndex > -1) {
        // 選択解除
        this.selectedPlayers.splice(existingIndex, 1);

      } else {
        // 選択追加
        this.selectPlayer(playerId, teamIndex, playerIndex);
      }
    },

    /**
     * 全選択解除
     */
    clearSelection() {

      this.selectedPlayers = [];
      this.selectionCounter = 0;
      this.updatePlayerVisualSelection();
    },

    /**
     * プレイヤーが選択されているかチェック
     */
    isPlayerSelected(playerId) {
      return this.selectedPlayers.some(p => p.id === playerId);
    },

    /**
     * 選択順序を取得
     */
    getSelectionOrder(playerId) {
      const player = this.selectedPlayers.find(p => p.id === playerId);
      return player ? player.order : 0;
    },

    /**
     * 選択状態の視覚的更新
     */
    updatePlayerVisualSelection() {
      console.log('🎨 視覚的更新開始:', { selectedPlayersCount: this.selectedPlayers.length, selectedPlayers: this.selectedPlayers });

      const teams = this.teams;

      teams.forEach((team, teamIndex) => {
        let players = [...document.getElementsByClassName(team.name)];

        players.forEach((playerElement, playerIndex) => {
          const playerId = `${teamIndex}_${playerIndex}`;
          const isSelected = this.isPlayerSelected(playerId);
          const selectionOrder = this.getSelectionOrder(playerId);
          const isMultiSelected = this.selectedPlayers.length > 1 && isSelected;

          console.log(`🔍 視覚更新 [${teamIndex}][${playerIndex}]:`, {
            playerId,
            isSelected,
            selectionOrder,
            isMultiSelected,
            hasElement: !!playerElement
          });

          // CSSクラスを更新
          playerElement.classList.toggle('selected', isSelected && !isMultiSelected);
          playerElement.classList.toggle('multi-selected', isMultiSelected);

          // 選択順序をdata属性として設定
          if (isSelected) {
            playerElement.setAttribute('data-selection-order', selectionOrder.toString());
          } else {
            playerElement.removeAttribute('data-selection-order');
          }
        });
      });
    },

    /**
     * 複数選択のドラッグ開始処理
     * 選択された全プレイヤーの初期位置を記録
     * @param {string} draggedPlayerId - ドラッグされたプレイヤーID
     */
    startMultiDrag(draggedPlayerId) {


      // 選択された全プレイヤーの初期位置を保存
      this.initialPositions = {};

      this.selectedPlayers.forEach(selectedPlayer => {
        const { teamIndex, playerIndex } = this.findPlayerIndices(selectedPlayer.id);
        if (teamIndex !== -1 && playerIndex !== -1 && this.players[teamIndex] && this.players[teamIndex][playerIndex]) {
          this.initialPositions[selectedPlayer.id] = {
            x: this.players[teamIndex][playerIndex].x,
            y: this.players[teamIndex][playerIndex].y
          };

        }
      });

      // ドラッグされたプレイヤーが選択されていない場合は追加選択
      if (!this.isPlayerSelected(draggedPlayerId)) {
        const { teamIndex, playerIndex } = this.findPlayerIndices(draggedPlayerId);
        if (teamIndex !== -1 && playerIndex !== -1) {

          this.selectPlayer(draggedPlayerId, teamIndex, playerIndex);

          // 新しく追加されたプレイヤーの初期位置も保存
          if (this.players[teamIndex] && this.players[teamIndex][playerIndex]) {
            this.initialPositions[draggedPlayerId] = {
              x: this.players[teamIndex][playerIndex].x,
              y: this.players[teamIndex][playerIndex].y
            };
          }

          // 選択状態の視覚更新
          this.updatePlayerVisualSelection();
        }
      }
    },

    /**
     * プレイヤーのインデックスを検索
     * @param {string} playerId - プレイヤーID
     * @returns {Object} チームインデックスとプレイヤーインデックス
     */
    findPlayerIndices(playerId) {
      const [teamIndex, playerIndex] = playerId.split('_').map(Number);
      return { teamIndex, playerIndex };
    },

    /**
     * 複数選択プレイヤーの同時移動
     * @param {string} draggedPlayerId - ドラッグされたプレイヤーID
     * @param {number} newX - 新しいX座標
     * @param {number} newY - 新しいY座標
     */
    moveSelectedPlayers(draggedPlayerId, newX, newY) {
      if (this.selectedPlayers.length <= 1) {
        return; // 複数選択でない場合は通常の移動
      }



      const draggedInitialPos = this.initialPositions[draggedPlayerId];
      if (!draggedInitialPos) {

        return;
      }

      // ドラッグされたプレイヤーの移動量を計算
      const deltaX = newX - draggedInitialPos.x;
      const deltaY = newY - draggedInitialPos.y;



      // 選択された全プレイヤーを相対移動
      this.selectedPlayers.forEach(selectedPlayer => {
        const { teamIndex, playerIndex } = this.findPlayerIndices(selectedPlayer.id);
        const initialPos = this.initialPositions[selectedPlayer.id];

        if (teamIndex !== -1 && playerIndex !== -1 && initialPos && this.players[teamIndex] && this.players[teamIndex][playerIndex]) {
          const newPlayerX = initialPos.x + deltaX;
          const newPlayerY = initialPos.y + deltaY;

          // プレイヤーデータを更新
          this.players[teamIndex][playerIndex].x = newPlayerX;
          this.players[teamIndex][playerIndex].y = newPlayerY;

          // DOM要素の位置も更新
          const playerElements = [...document.getElementsByClassName(this.teams[teamIndex].name)];
          if (playerElements[playerIndex]) {
            playerElements[playerIndex].style.left = newPlayerX + 'px';
            playerElements[playerIndex].style.top = newPlayerY + 'px';
          }


        }
      });
    },

    /**
     * プレイヤーを作成（縦並び配置でパネル干渉を回避）
     * - チーム別に列を分けて配置
     * - 右側コントロールパネルとの重複を避ける
     */
    createPlayers() {
      // 配置パラメータの定義
      const playerSize = 24;         // プレイヤーサイズ（24px × 24px）
      const margin = 5;              // プレイヤー間のマージン
      const panelWidth = 320;        // 右側コントロールパネルの幅
      const safetyMargin = 60;       // パネルとの安全マージン
      const additionalOffset = 50;   // 追加のオフセット（ユーザー調整値）

      // 画面幅を取得してコントロールパネルを考慮した配置位置を計算
      const windowWidth = window.innerWidth;
      const startX = windowWidth - panelWidth - safetyMargin - additionalOffset;
      const startY = 50; // 上端からの開始位置

      // 2チーム分のプレイヤーを作成（j=0:自チーム, j=1:相手チーム）
      for (let j = 0; j < 2; j++) {
        let players = []; // チーム内プレイヤー配列

        // 各チーム15人のプレイヤーを作成
        for (let i = 1; i <= 15; i++) {
          let player = {
            // X座標：チーム別に列を分ける（左列・右列）
            x: startX + (j * (playerSize + margin) * 2),
            // Y座標：背番号順に縦並び（1番が一番上）
            y: startY + ((i - 1) * (playerSize + margin)),
            number: i,                    // 背番号（1〜15）
            zIndex: i * 10 + j * 150     // 重ね順（背番号×10 + チーム×150）
          }
          players.push(player);
        }
        this.players.push(players); // チーム配列をメインデータに追加
      }

      // ボール配置（プレイヤー列の下部）
      let ball = [{
        x: startX + 30,                                    // プレイヤー列の中央付近
        y: startY + (15 * (playerSize + margin)) + 20,     // 15人目の下 + 20px
        number: 0,                                         // ボールの識別番号
        zIndex: 310                                        // 重ね順（プレイヤーより上）
      }];
      this.players.push(ball); // ボールをプレイヤー配列に追加（インデックス2）

      // ポイントマーカー配置（ボールの下部）
      let points = [];
      const pointStartY = startY + (15 * (playerSize + margin)) + 60; // ボールの下に配置

      // 横並びのポイントマーカー（S, R, M）を作成
      for (let i = 0; i < 3; i++) {
        let point = {
          x: startX + i * 35,           // 35px間隔で横並び
          y: pointStartY,               // 同じY座標で横一列
          number: i,                    // ポイント番号（0:S, 1:R, 2:M）
          zIndex: 320 + i * 10         // 重ね順
        };
        points.push(point)
      }

      // ラインアウトマーカー（L）を作成（下の行）
      let point = {
        x: startX,                      // 左端に配置
        y: pointStartY + 35,            // 下の行（35px下）
        number: 3,                      // ラインアウトの識別番号
        zIndex: 350                     // 最前面
      }
      points.push(point)
      this.players.push(points); // ポイントマーカー配列を追加（インデックス3）
    },

    /**
     * 初期配置を設定
     * LocalStorageに保存されたプレイヤー配置データを復元
     * ページリロード時に前回の配置を復元するために使用
     */
    placement() {
      const clone_players = localStorage.getItem('players');
      if (clone_players) {
        // JSON文字列をオブジェクトに変換してプレイヤー配置を復元
        this.players = JSON.parse(clone_players);
      }
    },
  },
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

#container {
  display: flex;
  user-select: none;
  height: calc(100vh - 60px);
  overflow: hidden;
}

#board {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-width: 0; /* フレックスアイテムの縮小を許可 */
}

.rugby-field {
  position: relative;
  z-index: 1;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  background-color: transparent;
  cursor: crosshair;
  pointer-events: none; /* マウスイベントをRugbyFieldに透過 */
}

.player {
  text-align: center;
  font-size: 12px;
  line-height: 24px;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  user-select: none;
  text-shadow: .3px .3px .3px rgba(255, 255, 255, 0.66);
  box-shadow: inset 0px 1.5px 0 rgba(255,255,255,0.3), 0 1.5px 1.5px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.my-team {
  background: rgb(235, 25, 25);
  color: white;
}

.my-team:hover {
  background: rgb(236, 90, 90);
}

.opponent {
  background: rgb(0, 0, 0);
  color: white;
}

.opponent:hover {
  background: rgb(56, 56, 56);
}

.points {
  background: rgb(2, 53, 219);
  color: white;
  font-size: 36px;
  line-height: 60px;
  height: 60px;
  width: 60px;
}

.points:hover {
  background: rgb(27, 63, 224);
}

.ball {
  width: 30px;
  height: 30px;
  border-top-left-radius: 40px;
  border-top-right-radius: 15px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 40px;
  background: none;
}

.line-out {
  width: 90px;
  border-radius: 5px;
  height: 40px;
  line-height: 44px;
}

.drawPlayer:hover {
  cursor: grab;
}

.drawPlayer:active {
  cursor: grabbing;
}

.marker {
  z-index: 1000;
  text-align: center;
  position: absolute;
  font-size: 12px;
  line-height: 20px;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  user-select: none;
  background: yellow;
  box-shadow: inset 0px 1.5px 0 rgba(255,255,255,0.3), 0 1.5px 1.5px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.marker:hover {
  cursor: grab;
}

.marker:active {
  cursor: grabbing;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1001;
  width: 300px;
}

.modalBody {
  margin-bottom: 20px;
}

.modalBody > p {
  margin-bottom: 10px;
  font-size: 16px;
}

.modalBody > input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modalFootter {
  text-align: right;
}

.register {
  display: inline-block;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.register:hover {
  background-color: #45a049;
}

#mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* ===== 複数選択機能のスタイル ===== */

/* 単一選択状態（デザイン変化なし） */
.player.selected {
  /* 単一選択時は特別なスタイルを適用しない */
}

/* 複数選択状態（旧単一選択のデザインを適用） */
.player.multi-selected {
  border: 3px solid #ffd700 !important;
  transform: scale(1.1);
  box-shadow: 0 0 0 1px rgba(255, 215, 0, 0.3), 0 0 15px rgba(255, 215, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.3) !important;
  z-index: 25 !important;
}

/* 複数選択時のチェックマーク */
.player.multi-selected::after {
  content: "✓";
  position: absolute;
  top: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 30;
  animation: checkmarkAppear 0.3s ease-out;
}

/* 複数選択の順序バッジ */
.player.multi-selected::before {
  content: attr(data-selection-order);
  position: absolute;
  top: -10px;
  left: -10px;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border-radius: 50%;
  font-size: 9px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 31;
}

/* アニメーション */
@keyframes checkmarkAppear {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ===== 矩形選択機能のスタイル ===== */

/* 矩形選択モードのカーソル */
#board.rectangle-mode {
  cursor: crosshair;
}

/* 矩形選択時のプレイヤークリック無効化 */
#board.rectangle-mode .player {
  pointer-events: none;
}

/* 選択矩形の可視化 */
.selection-rectangle {
  position: absolute;
  border: 2px dashed #2196f3;
  background: rgba(33, 150, 243, 0.1);
  pointer-events: none;
  z-index: 1000;
  animation: rectanglePulse 1s ease-in-out infinite alternate;
}

@keyframes rectanglePulse {
  from {
    border-color: #2196f3;
  }
  to {
    border-color: #64b5f6;
  }
}
</style>
