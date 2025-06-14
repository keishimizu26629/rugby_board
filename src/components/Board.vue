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
      <div id="board">
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
      </div>

      <!-- コントロールパネル -->
      <ControlPanel
        :board-settings="boardSettings"
        :line-settings="lineSettings"
        :positions="positions"
        :selected-position="selectPosition"
        :is-loading="isLoading"
        @update-board-settings="updateBoardSettings"
        @update-line-settings="updateLineSettings"
        @add-marker="addSpot"
        @remove-marker="removeMarker"
        @clear-players="clearPlayer"
        @clear-drawing="cleardrawPath"
        @save-position="openModal"
        @apply-position="applyPosition"
        @delete-position="deletePosition"
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
      players: [],
      teams: [
        {name: 'my-team'},
        {name: 'opponent'},
        {name: 'ball'},
        {name: 'points'},
      ],
      gX: 0,
      gY: 0,
      canvas: null,
      context: null,
      isDraw: false,
      selectPosition: '',
      inputPosition: '',
      modal: false,
      isLoading: false,
      isMove: false,
      shiftX: 0,
      shiftY: 0,
      drawPath: [],
      drawPath2: [],
      selectedPlayers: [],
      count: 0,
      testPositions: [],

      // Board Settings
      boardSettings: {
        showLines: true,
        showNumbers: true
      },

      // Line Settings
      lineSettings: {
        color: 'white',
        width: 4
      },

      selectedColor: { label: '白', value: 'white' },
      colors: [
        { label: '白', value: 'white' },
        { label: '黒', value: 'black' },
        { label: '赤', value: 'red' },
        { label: '青', value: 'blue' },
        { label: '黄', value: 'yellow' },
        { label: '消しゴム', value: 'transparent' },
      ],
      selectedLineWidth: { label: '4px', value: 4 },
      lineWidths: [
        { label: '細', value: 2 },
        { label: '中', value: 4 },
        { label: '太', value: 6 },
      ],
      selectedNumBool: { label: 'あり', value: true },
      numBool: [
        { label: 'あり', value: true},
        { label: 'なし', value: false},
      ],
      selectedLineBool: { label: 'あり', value: true },
      lineBool: [
        { label: 'あり', value: true},
        { label: 'なし', value: false},
      ],
      markers: [],
      obj_marker: {
        x: 100,
        y: 100,
        index: 0,
      },
      ePageX: null,
      ePageY: null,
      moveMarker: null,
    }
  },
  computed: {
    positions() {
      return this.authStore.positions;
    },
    uid() {
      return this.authStore.loginUser?.uid;
    },
    convertPx() {
      return (num) => {
        return num + 'px'
      }
    },
  },
  watch: {
    // ログインユーザーが変更されたときにデータを取得
    'authStore.loginUser': {
      handler(newUser) {
        if (newUser) {
          this.authStore.fetchData();
        }
      },
      immediate: true
    }
  },
  created() {
    this.createPlayers();
  },
  mounted() {
    this.canvas = document.querySelector('#canvas')
    this.context = this.canvas.getContext('2d')

    window.addEventListener('mousemove', this.moveAtMarker);
    window.addEventListener('resize', this.syncCanvasPosition);

    // 描画イベントはRugbyFieldから受け取るため、直接のイベントリスナーは不要

    this.placement();
    this.drawAgain(this.context);

    // 初期化時に登録済みのポジションデータを取得
    if (this.authStore.loginUser) {
      this.authStore.fetchData();
    }

    // Controlキーのイベントは現在不要なためコメントアウト
    // window.addEventListener('keydown', e => {
    //   if(e.key == 'Control') {
    //     this.onPressControlKey = true
    //   }
    // });
    // window.addEventListener('keyup', e => {
    //   if(e.key == 'Control') {
    //     this.onPressControlKey = false
    //   }
    // });

    // プレイヤーの初期配置とドラッグイベントを設定
    this.$nextTick(() => {
      this.initializePlayerDragEvents();
      this.syncCanvasPosition();
    });
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.moveAtMarker);
    window.removeEventListener('resize', this.syncCanvasPosition);
  },

  methods: {
    /**
     * ボードの設定を更新
     */
    updateBoardSettings(setting, value) {
      this.boardSettings[setting] = value;
      if (setting === 'showNumbers') {
        this.selectedNumBool.value = value;
      }
      if (setting === 'showLines') {
        this.selectedLineBool.value = value;
      }
    },

    /**
     * 描画設定を更新
     */
    updateLineSettings(settings) {
      this.lineSettings = { ...this.lineSettings, ...settings };
      // 古い形式の設定も更新
      if (settings.color) {
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
        const widthMap = {
          2: { label: '細', value: 2 },
          4: { label: '中', value: 4 },
          6: { label: '太', value: 6 }
        };
        this.selectedLineWidth = widthMap[settings.width] || this.selectedLineWidth;
      }
    },

    /**
     * ポジションを適用
     */
    applyPosition(positionName) {
      this.selectPosition = positionName;
      this.customPlacement(this.positions);
    },

    /**
     * 描画キャンバスの位置をRugbyFieldと同期
     */
    syncCanvasPosition() {
      const rugbyField = this.$refs.rugbyField.$refs.fieldCanvas;
      const canvas = this.canvas;

      if (rugbyField && canvas) {
        const rugbyRect = rugbyField.getBoundingClientRect();
        const boardRect = document.getElementById('board').getBoundingClientRect();

        // RugbyFieldのボード内での相対位置を計算
        const relativeLeft = rugbyRect.left - boardRect.left;
        const relativeTop = rugbyRect.top - boardRect.top;

        // 描画キャンバスを同じ位置に配置
        canvas.style.left = relativeLeft + 'px';
        canvas.style.top = relativeTop + 'px';
        canvas.style.width = rugbyRect.width + 'px';
        canvas.style.height = rugbyRect.height + 'px';
      }
    },

    /**
     * プレイヤーのドラッグイベントを初期化
     */
    initializePlayerDragEvents() {
      let teams = this.teams;
      teams.forEach((team, i) => {
        let players = [...document.getElementsByClassName(team.name)];
        players.forEach((player, index) => {
          if (this.players[i] && this.players[i][index]) {
            player.style.position = 'absolute';
            player.style.left = this.players[i][index].x + 'px';
            player.style.top = this.players[i][index].y + 'px';
            player.style.zIndex = this.players[i][index].zIndex;

            player.addEventListener('mousedown', event => {
              event.preventDefault();
              this.isMove = true;

              // ボードコンテナの位置を取得
              const boardRect = document.getElementById('board').getBoundingClientRect();
              const playerRect = player.getBoundingClientRect();

              // マウスとプレイヤーの相対位置を計算
              let shiftX = event.clientX - playerRect.left;
              let shiftY = event.clientY - playerRect.top;

              this.setZIndex(players, i, index);

              const moveAt = (clientX, clientY) => {
                // ボードコンテナ内での相対位置を計算
                const newX = clientX - boardRect.left - shiftX;
                const newY = clientY - boardRect.top - shiftY;

                player.style.left = newX + 'px';
                player.style.top = newY + 'px';
              };

              const onMouseMove = (event) => {
                moveAt(event.clientX, event.clientY);
              };

              // 初期位置を設定
              moveAt(event.clientX, event.clientY);
              document.addEventListener('mousemove', onMouseMove);

              const onMouseUp = (e) => {
                this.isMove = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                // 最終位置を保存（ボードコンテナ内での相対位置）
                const finalX = e.clientX - boardRect.left - shiftX;
                const finalY = e.clientY - boardRect.top - shiftY;
                this.measuresReload(finalX, finalY, i, index);
              };

              document.addEventListener('mouseup', onMouseUp);
            });

            player.ondragstart = function() {
              return false;
            };
          }
        });
      });
    },

        /**
     * キャンバス上の正確な座標を取得
     */
    getCanvasCoordinates(event) {
      const canvas = this.canvas;
      const rugbyField = this.$refs.rugbyField.$refs.fieldCanvas;

      // RugbyFieldキャンバスの位置を基準とする
      const rect = rugbyField.getBoundingClientRect();

      // キャンバスのスケールを考慮した座標計算
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      };
    },

    /**
     * 描画機能
     */
    draw(e) {
      if(!this.isDraw) {
        return;
      }

      const coords = this.getCanvasCoordinates(e);
      const x = coords.x;
      const y = coords.y;

      this.context.lineWidth = this.selectedLineWidth.value;
      this.context.strokeStyle = this.selectedColor.value;

      if (this.selectedColor.value == 'transparent') {
        this.context.globalCompositeOperation = 'destination-out';
        this.context.lineWidth = this.selectedLineWidth.value * 3;
        this.context.strokeStyle = 'white'
      } else {
        this.context.globalCompositeOperation = 'source-over';
      }

      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
      this.context.beginPath();
      this.context.moveTo(this.gX, this.gY);
      this.context.lineTo(x, y);
      this.context.stroke();
      this.gX = x;
      this.gY = y;
    },

    drawStart(e) {
      let players = [...document.getElementsByClassName('player')];
      players.forEach(player => {
        player.classList.remove('drawPlayer');
      });
      if(this.isMove) {
        return;
      }
      this.isDraw = true;

      const coords = this.getCanvasCoordinates(e);
      this.gX = coords.x;
      this.gY = coords.y;
    },

    drawEnd() {
      this.context.closePath();
      this.isDraw = false;
      let players = [...document.getElementsByClassName('player')];
      players.forEach(player => {
        player.classList.add('drawPlayer');
      });
      const canvas = this.canvas;
      let data = canvas.toDataURL();
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
      console.log('プロフィール設定が選択されました');
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
     */
    rellocation() {
      let teams = this.teams;
      teams.forEach((team, i) => {
        let players = [...document.getElementsByClassName(team.name)];
        players.forEach((player, index) => {
          if (this.players[i] && this.players[i][index]) {
            player.style.position = 'absolute';
            player.style.left = this.players[i][index].x + 'px';
            player.style.top = this.players[i][index].y + 'px';
            player.style.zIndex = this.players[i][index].zIndex;
          }
        });
      });
      localStorage.setItem('players', JSON.stringify(this.players));
    },

    /**
     * プレイヤーを作成
     */
    createPlayers() {
      const boardWidth = 900;
      const playerSize = 24;
      const margin = 5;
      const startX = boardWidth + 10;
      const startY = 400;

      for (let j = 0; j < 2; j++) {
        let players = [];
        for (let i = 1; i <= 15; i++) {
          let player = {
            x: startX + ((i - 1) * (playerSize + margin)),
            y: startY + (j * (playerSize + margin) * 2),
            number: i,
            zIndex: i * 10 + j * 150
          }
          players.push(player);
        }
        this.players.push(players);
      }

      let ball = [{
        x: 1120,
        y: 520,
        number: 0,
        zIndex: 310
      }];
      this.players.push(ball);

      let points = [];
      for (let i = 0; i < 3; i++) {
        let point = {
          x: startX + i * 65,
          y: startY + 2 * (playerSize + margin) * 2,
          number: i,
          zIndex: 320 + i * 10
        };
        points.push(point)
      }
      let point = {
        x: startX,
        y: startY + 2 * (playerSize + margin) * 2 + 65,
        number: 3,
        zIndex: 350
      }
      points.push(point)
      this.players.push(points);
    },

    /**
     * 初期配置を設定
     */
    placement() {
      const clone_players = localStorage.getItem('players');
      if (clone_players) {
        this.players = JSON.parse(clone_players);
      }
    },

    /**
     * プレイヤー位置をリロード時に保存
     */
    measuresReload(left, top, i, index) {
      this.players[i][index].x = left;
      this.players[i][index].y = top;
      localStorage.setItem('players', JSON.stringify(this.players));
    },

    /**
     * 描画を再描画
     */
    drawAgain(ctx) {
      let data = localStorage.getItem('drawPath')
      if (data) {
        let img = new Image();
        img.src = data;
        img.onload = function(){
          ctx.drawImage(img, 0, 0, 660, 580);
        }
      }
    },

    /**
     * 描画をクリア
     */
    cleardrawPath() {
      localStorage.removeItem('drawPath');
      this.drawPath = [];
      this.drawPath2 = [];
      this.resetDrawPath();
    },

    resetDrawPath() {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 660, 580);
    },

    setZIndex(players, i, index) {
      let playersAll = document.getElementsByClassName('player');
      let targetNumber = Number(players[index].style.zIndex);
      for (let j = 0; j < playersAll.length; j++) {
        if (targetNumber < Number(playersAll[j].style.zIndex)) {
          playersAll[j].style.zIndex = playersAll[j].style.zIndex - 10;
          this.players[i][index].zIndex = playersAll[j].style.zIndex;
        }
      }
      players[index].style.zIndex = 350;
    },

    /**
     * プレイヤーをクリア
     */
    clearPlayer() {
      this.players = [];
      this.createPlayers();
      this.rellocation();
      localStorage.removeItem('players');
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
  background: rgb(107, 107, 107);
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
</style>
