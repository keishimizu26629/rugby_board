<template>
  <div id="app">
    <div id="container">
      <div id="piece"></div>
      <div id="board">
        <!-- <canvas id="ground" width="660" height="580"></canvas>
        <canvas id="canvas" width="660" height="580"></canvas> -->
        <canvas id="ground" width="660" height="580"></canvas>
        <canvas
          id="canvas"
          width="660"
          height="580"
        ></canvas>
      </div>
      <div
        v-for="marker in markers"
        :key="marker.index"
        :style="{left: convertPx(marker.x), top: convertPx(marker.y)}"
        class="marker"
        @mousedown="touchstart($event, marker)"
        @mouseup="touchend()"
        ref="element"
      >
      </div>
      <div class="rightElements">
        <div id="logout-container">
          <v-btn @click="logout()" class="button" id="logout">ログアウト</v-btn>
        </div>
        <div class="buttons">
          <div class="left-buttons">
            <div class="paint-wrap">
              <div>ペイント</div>
              <div class="select-wrap">
                <v-select
                  :items="lineWidths"
                  v-model="selectedLineWidth"
                  item-text="label"
                  item-value="value"
                  label="太さ"
                  dense
                  solo
                  return-object
                  class="select-box"
                ></v-select>
                <v-select
                  :items="colors"
                  v-model="selectedColor"
                  item-text="label"
                  item-value="value"
                  label="色"
                  dense
                  solo
                  return-object
                  class="select-box"
                ></v-select>
              </div>
              <div class="paint-button-wrap">
                <v-btn
                  @click="cleardrawPath()"
                  rounded
                  class="button clear"
                  id="paint"
                >クリア</v-btn>
              </div>
            </div>
            <div class="toggle_options">
              <table>
                <tr>
                  <th>白線</th>
                  <th>背番号</th>
                </tr>
                <tr>
                  <td><v-select
                    :items="lineBool"
                    v-model="selectedLineBool"
                    item-text="label"
                    item-value="value"
                    label="線"
                    dense
                    solo
                    return-object
                    class="select-box"
                    v-on:change="changeGroundLine"
                    ></v-select>
                  </td>
                  <td><v-select
                    :items="numBool"
                    v-model="selectedNumBool"
                    item-text="label"
                    item-value="value"
                    label="背番号"
                    dense
                    solo
                    return-object
                    class="select-box"
                    ></v-select>
                  </td>
                </tr>
              </table>
            </div>
            <div class="toggle_options">
              <div>
                <div>
                  マーカー
                </div>
                <div>
                  <v-btn
                    @click="addSpot()"
                    elevation="2"
                    class="button add-btn"
                  >追加</v-btn>
                  <v-btn
                    @click="removeMarker()"
                    elevation="2"
                    class="button add-btn"
                  >削除</v-btn>
                </div>
              </div>
            </div>
          </div>
          <!-- <div @click="scrum()" class="button" id="paint">scrum</div> -->
          <div class="player-button-wrap">
            <!-- <v-btn @click="openModal()" class="button" id="paint">登録</v-btn> -->
            <button @click="openModal()" class="button bt-samp78" id="paint">+</button>
            <!-- <v-btn @click="customPlacement(positions)" class="button" id="paint">配置</v-btn> -->
            <button @click="customPlacement(positions)" class="button bt-samp78" id="paint">▶</button>
            <v-btn
              @click="clearPlayer()"
              rounded
              elevation="2"
              class="button clear"
            >クリア</v-btn>
            <div v-for="(position, index) in positions" :key="`position-${index}`">
            <label class="label">
              <input type="radio"
                    :id="`position-${index}`"
                    v-model="selectPosition"
                    name="selectPosition"
                    :value="position.name">
              <span class="custom-radio"></span>
              <span class="label-text">{{ position.name }}</span>
              <span class="delete" @click.stop="deletePosition(position.name)">[×]</span>
            </label>
          </div>
          </div>
        </div>
      </div>
    </div>
    <template v-if="selectedNumBool.value">
      <div
      v-for="player in players[0]"
      :key="player.id"
      class="player my-team drawPlayer"
      @mousedown="testDrag"
    >{{ player.number }}</div>
      <div v-for="player in players[1]" :key="player.id" class="player opponent drawPlayer">{{ player.number }}</div>
    </template>
    <template v-else>
      <div v-for="player in players[0]" :key="player.id" class="player my-team drawPlayer"></div>
      <div v-for="player in players[1]" :key="player.id" class="player opponent drawPlayer"></div>
    </template>
    <div class="player points drawPlayer">S</div>
    <div class="player points drawPlayer">R</div>
    <div class="player points drawPlayer">M</div>
    <div class="player points drawPlayer line-out">L</div>
    <img src="ball.png" class="player ball drawPlayer">
    <!-- <div
      class="test"
      @mousedown="testDrag"
    >T</div> -->
    <section v-if="modal" id="sendModal" class="modal">
      <div class="modalBody">
        <p>配置の名前を入力してください。</p>
        <input type="text" v-model="inputPosition">
        <div id="sendError"></div>
      </div>
      <div class="modalFootter">
        <div class="register" @click="testPost">登録</div>
      </div>
    </section>
    <div v-if="modal" id="mask" @click="closeModal"></div>
  </div>
</template>

<script>
import firebase from 'firebase';
export default {
  name: 'App',
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
      mask: false,
      modal: false,
      isMove: false,
      shiftX: 0,
      shiftY: 0,
      drawPath: [],
      drawPath2: [],
      selectedPlayers: [],
      onPressControlKey: false,
      count: 0,
      testPositions: [],
      selectedColor: { label: '白', value: 'white' }, //初期値
      colors: [
        { label: '白', value: 'white' },
        { label: '黒', value: 'black' },
        { label: '赤', value: 'red' },
        { label: '青', value: 'blue' },
        { label: '黄', value: 'yellow' },
        { label: '消しゴム', value: 'transparent' },
      ],
      selectedLineWidth: { label: '4px', value: 4 }, //初期値
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
  watch: {
    state() {

    }
  },
  computed: {
    positions() {
      return this.$store.getters.positions;
    },
    uid() {
      return this.$store.getters.loginUser.uid;
    },
    convertPx() {
      return (num) => {
        return num + 'px'
      }
    },
  },
  created() {
    this.createPlayers();
  },
  mounted() {
    this.canvas = document.querySelector('#canvas')
    this.context = this.canvas.getContext('2d')

    // window.addEventListener('mousedown', e => {
    //   this.drawStart(e);
    // });
    window.addEventListener('mousemove', this.moveAtMarker);
    // window.addEventListener('mouseup', () => {
    //   this.drawEnd();
    // });
    this.canvas.addEventListener('mousedown', e => {
      this.drawStart(e);
    });
    this.canvas.addEventListener('mousemove', e => {
      this.draw(e);
    });
    this.canvas.addEventListener('mouseup', () => {
      this.drawEnd();
    });

    this.placement();
    this.drawAgain(this.context);

    window.addEventListener('keydown', e => {
      if(e.key == 'Control') {
        this.onPressControlKey = true
      }
    });
    window.addEventListener('keyup', e => {
      if(e.key == 'Control') {
        this.onPressControlKey = false
      }
    });

    let teams = this.teams

    teams.forEach((team, i) => {
      let players = [...document.getElementsByClassName(team.name)];
      players.forEach((player, index) => {
        player.style.position = 'absolute';
        player.style.left = this.players[i][index].x + 'px';
        player.style.top = this.players[i][index].y + 'px';
        player.style.zIndex = this.players[i][index].zIndex;
        player.addEventListener('mousedown', event => {
          this.isMove = true;
          // event.classList.add('isMove');
          console.log(player.getBoundingClientRect())
          let shiftX = event.clientX - player.getBoundingClientRect().left;
          let shiftY = event.clientY - player.getBoundingClientRect().top;

          this.setZIndex(players, i, index);

          moveAt(event.pageX, event.pageY, index);

          function moveAt(pageX, pageY) {
            player.style.left = pageX - shiftX + 'px';
            player.style.top = pageY - shiftY + 'px';
          }
          function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
          }

          document.addEventListener('mousemove', onMouseMove);

          player.addEventListener('mouseup', e => {
            this.isMove = false;
            // e.classList.remove('isMove');
            document.removeEventListener('mousemove', onMouseMove);
            this.measuresReload(e.pageX - shiftX, e.pageY - shiftY, i, index);
          });
        });
        player.ondragstart = function() {
          return false;
        };
      });
    });
  },

  methods: {
    draw(e) {
      // let x = e.offsetX;
      // let y = e.offsetY;
      let x = e.layerX;
      let y = e.layerY;
      // let canvasClientRect = this.canvas.getBoundingClientRect();
      if(!this.isDraw) {
        return;
      }
      // if(e.clientX < canvasClientRect.left || e.clientX > canvasClientRect.right
      //   || e.clientY < canvasClientRect.top || e.clientY > canvasClientRect.bottom) {
      //   this.gX = x;
      //   this.gY = y;
      //   return;
      // }
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
      // this.gX = e.offsetX;
      // this.gY = e.offsetY;
      this.gX = e.layerX;
      this.gY = e.layerY;
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
    testDrag(e) {
      console.log(e)
    },

    async testFetch() {
      try {
        const response = await firebase.firestore().collection('users').doc(this.uid).get();
        const positions = response.data().positions;
        this.testPositions = [];
        Object.entries(positions).forEach(object => {
          let position = {};
          position.name = object[1].name;
          position.position = object[1].position;
          this.testPositions.push(position);
        });
      } catch(e) {
        console.log(e);
      }
    },
    logout: function() {
      this.$store.dispatch('logout');
    },
    testMove() {
      setTimeout(() => {
        this.testSetTimeout()
      }, 100);
    },
    testSetTimeout() {
      this.players[0][9].y = this.players[0][9].y - 0.1;
      this.players[0][11].y = this.players[0][11].y - 0.1;
      this.players[0][11].x = this.players[0][11].x + 0.1;
      this.players[0][12].y = this.players[0][12].y - 0.1;
      this.players[0][12].x = this.players[0][12].x - 0.1;
      // console.log(this.count);
      this.rellocation();
      this.count = this.count + 1;
      if (this.count < 2000) {
        setTimeout(() => {
          this.testSetTimeout()
        }, 1)
      } else {
        this.count = 0;
      }
    },
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
    testPost() {
      const position = this.transformObject();
      this.$store.dispatch('testPost', {name: this.inputPosition, players: position});
      this.closeModal();
    },
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
    rellocation() {
      let teams = this.teams
      teams.forEach((team, i) => {
        let players = [...document.getElementsByClassName(team.name)];
        players.forEach((player, index) => {
          // console.log(this.players[i][index]);
          player.style.position = 'absolute';
          player.style.left = this.players[i][index].x + 'px';
          player.style.top = this.players[i][index].y + 'px';
          player.style.zIndex = this.players[i][index].zIndex;
        });
      });
      localStorage.setItem('players', JSON.stringify(this.players));
    },
    createPlayers() {
      const boardWidth = 900;  // ボードの幅
      const playerSize = 24;   // プレイヤーの大きさ
      const margin = 5;        // マージン
      const startX = boardWidth + 10; // ボードの右端から少し離れた位置
      const startY = 400;  // マーカーの位置に応じて調整

      for (let j = 0; j < 2; j++) {
        let players = [];
        for (let i = 1; i <= 15; i++) {
          let player = {
            x: startX + ((i - 1) * (playerSize + margin)),
            y: startY + (j * (playerSize + margin) * 2), // チーム間のスペースを広げる
            number: i,
            zIndex: i * 10 + j * 150
          }
          players.push(player);
        }
        this.players.push(players);
      }

      // ボールの位置は変更しない
      let ball = [{
        x: 1120,
        y: 520,
        number: 0,
        zIndex: 310
      }];
      this.players.push(ball);

      // ポイントマーカーの位置も調整
      let points = [];
      for (let i = 0; i < 3; i++) {
        let point = {
          x: startX + i * 65,
          y: startY + 2 * (playerSize + margin) * 2, // チームの下に配置
          number: i,
          zIndex: 320 + i * 10
        };
        points.push(point)
      }
      let point = {
        x: startX,
        y: startY + 2 * (playerSize + margin) * 2 + 65, // 最後のポイントをさらに下に
        number: 3,
        zIndex: 350
      }
      points.push(point)
      this.players.push(points);
    },
    placement() {
      const clone_players = localStorage.getItem('players');
      this.drawGround();
      if (clone_players) {
        this.players = JSON.parse(clone_players);
      }
    },
    measuresReload(left, top, i, index) {
      this.players[i][index].x = left;
      this.players[i][index].y = top;
      localStorage.setItem('players', JSON.stringify(this.players));
    },
    drawAgain(ctx) {
      let data = localStorage.getItem('drawPath')
      let img = new Image();
      img.src = data;
      img.onload = function(){
        ctx.drawImage(img, 0, 0, 660, 580);
      }
    },
    drawBack() {
      localStorage.removeItem('drawPath');
      this.drawPath = [];
      this.drawPath2.pop();
      localStorage.setItem('drawPath', JSON.stringify(this.drawPath2));
      this.drawPath2 = [];
      this.resetDrawPath();
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      this.drawAgain(ctx);
    },
    setDrawPath(drawPath) {
      localStorage.removeItem('drawPath');
      localStorage.setItem('drawPath', JSON.stringify(drawPath));
    },
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
      // this.drawGround();
    },
    changeGroundLine() {
      const canvas = document.getElementById('ground');
      const ctx = canvas.getContext('2d');
      if (this.selectedLineBool.value == true) {
        this.drawGround();
      } else {
        ctx.clearRect(0, 0, 660, 580);
      }
    },
    setZIndex(players, i, index) {
      let playersAll = document.getElementsByClassName('player');
      let targetNumber = Number(players[index].style.zIndex);
      // console.log(targetNumber);
      for (let j = 0; j < playersAll.length; j++) {
        if (targetNumber < Number(playersAll[j].style.zIndex)) {
          playersAll[j].style.zIndex = playersAll[j].style.zIndex - 10;
          this.players[i][index].zIndex = playersAll[j].style.zIndex;
          // console.log(targetNumber, playersAll[j].style.zIndex);
        }
      }
      players[index].style.zIndex = 350;
    },
    clearPlayer() {
      this.players = [];
      this.createPlayers();
      this.rellocation();
      localStorage.removeItem('players');
      // window.location.reload();
    },
    scrum() {
      let coordinates = [
        [
          {x: 300, y: 290},{x: 310, y: 290},{x: 320, y: 290},{x: 305, y: 300},{x: 315, y: 300},
          {x: 290, y: 300},{x: 330, y: 300},{x: 310, y: 310},{x: 310, y: 340},{x: 390, y: 400},
          {x: 240, y: 400},{x: 475, y: 440},{x: 570, y: 460},{x: 700, y: 465},{x: 510, y: 500},
        ],
        [
          {x: 300, y: 270},{x: 310, y: 270},{x: 320, y: 270},{x: 305, y: 260},{x: 315, y: 260},
          {x: 290, y: 260},{x: 330, y: 260},{x: 310, y: 250},{x: 345, y: 240},{x: 390, y: 200},
          {x: 240, y: 200},{x: 475, y: 200},{x: 570, y: 200},{x: 690, y: 140},{x: 480, y: 100},
        ],
        [
          {x: 320, y: 320}
        ],
      ]
      let teams = this.teams
      teams.forEach((team, t_index) => {
      let players = document.getElementsByClassName(team.name);
        players.forEach((player, p_index) => {
          this.players[t_index][p_index].x = coordinates[t_index][p_index].x;
          this.players[t_index][p_index].y = coordinates[t_index][p_index].y;
          player.style.left = this.players[t_index][p_index].x + 'px';
          player.style.top = this.players[t_index][p_index].y + 'px';
        });
      });
      localStorage.setItem('players', JSON.stringify(this.players));
    },
    closeModal() {
      this.modal = false;
      this.inputPosition = '';
    },
    openModal() {
      this.modal = true;
      this.mask = true;
    },
    deletePosition(name) {
      if (confirm('削除しますか？')) {
        this.$store.dispatch('testDelete', name);
        // console.log(name);
      }
    },
    addSpot() {
      this.markers.push(Object.assign({}, this.obj_marker));
      let markers_length = this.markers.length;
      this.markers[markers_length-1].x += (10 * markers_length);
      this.markers[markers_length-1].y += (10 * markers_length);
      this.markers[markers_length-1].index = markers_length-1;
      console.log(this.markers);
    },
    removeMarker() {
      this.markers.pop();
    },
    touchstart(event, marker) {
      this.isMove = true;
      this.moveMarker = marker;
      if (!this.moveMarker) {
        console.error('Marker is null or undefined');
      }
      this.shiftX = event.clientX - this.$refs.element[marker.index].getBoundingClientRect().left;
      this.shiftY = event.clientY - this.$refs.element[marker.index].getBoundingClientRect().top;
      console.log(event, marker);
    },
    moveAtMarker(event) {
      if(!this.isMove || !this.moveMarker) {
        return
      }
      this.moveMarker.x = event.pageX - this.shiftX;
      this.moveMarker.y = event.pageY - this.shiftY;
    },
    touchend() {
      this.isMove = false;
      if (this.moveMarker) {
        this.moveMarker = null;
      }
    },
    drawGround() {
      const canvas = document.getElementById('ground');
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;

      let can_width = 660;
      let can_height = 580;
      let ground_leftRight = 30;
      let ground_topBottom = 10;

      //グランドの描画
      ctx.strokeRect(
        ground_leftRight, ground_topBottom,
        can_width - (ground_leftRight * 2), can_height - (ground_topBottom * 2)
      );

      ctx.beginPath();
      // ポール
      ctx.moveTo(200 / 440 * can_width,70); ctx.lineTo(200 / 440 * can_width,30);
      ctx.moveTo(240 / 440 * can_width,70); ctx.lineTo(240 / 440 * can_width,30);
      ctx.moveTo(200 / 440 * can_width,55); ctx.lineTo(240 / 440 * can_width,55);

      ctx.moveTo(200 / 440 * can_width,510); ctx.lineTo(200 / 440 * can_width,550);
      ctx.moveTo(240 / 440 * can_width,510); ctx.lineTo(240 / 440 * can_width,550);
      ctx.moveTo(200 / 440 * can_width,525); ctx.lineTo(240 / 440 * can_width,525);
      ctx.lineWidth = 6;
      ctx.stroke();
      //インゴール
      ctx.moveTo(ground_leftRight,70); ctx.lineTo(can_width - ground_leftRight,70);
      ctx.moveTo(ground_leftRight,510); ctx.lineTo(can_width - ground_leftRight,510);
      ctx.lineWidth = 3;
      ctx.stroke();
      //5m実線
      ctx.moveTo(48 / 440 * can_width,94); ctx.lineTo(72 / 440 * can_width,94);

      ctx.moveTo(368 / 440 * can_width,94); ctx.lineTo(392 / 440 * can_width,94);

      ctx.moveTo(48 / 440 * can_width,486); ctx.lineTo(72 / 440 * can_width,486);

      ctx.moveTo(368 / 440 * can_width,486); ctx.lineTo(392 / 440 * can_width,486);
      //ポール5m
      ctx.moveTo(176 / 440 * can_width,94); ctx.lineTo(200 / 440 * can_width,94);
      ctx.moveTo(240 / 440 * can_width,94); ctx.lineTo(264 / 440 * can_width,94);
      ctx.moveTo(176 / 440 * can_width,486); ctx.lineTo(200 / 440 * can_width,486);
      ctx.moveTo(240 / 440 * can_width,486); ctx.lineTo(264 / 440 * can_width,486);
      //15m実線
      ctx.moveTo(120 / 440 * can_width,70); ctx.lineTo(120 / 440 * can_width,95);
      ctx.moveTo(108 / 440 * can_width,94); ctx.lineTo(132 / 440 * can_width,94);

      ctx.moveTo(320 / 440 * can_width,70); ctx.lineTo(320 / 440 * can_width,95);
      ctx.moveTo(308 / 440 * can_width,94); ctx.lineTo(332 / 440 * can_width,94);

      ctx.moveTo(120 / 440 * can_width,510); ctx.lineTo(120 / 440 * can_width,485);
      ctx.moveTo(108 / 440 * can_width,486); ctx.lineTo(132 / 440 * can_width,486);

      ctx.moveTo(320 / 440 * can_width,510); ctx.lineTo(320 / 440 * can_width,485);
      ctx.moveTo(308 / 440 * can_width,486); ctx.lineTo(332 / 440 * can_width,486);

      //22mライン
      ctx.moveTo(ground_leftRight,157); ctx.lineTo(can_width - ground_leftRight,157);
      ctx.moveTo(ground_leftRight,413); ctx.lineTo(can_width - ground_leftRight,413);
      //ハーフライン
      ctx.moveTo(ground_leftRight,290); ctx.lineTo(can_width - ground_leftRight,290);
      ctx.lineWidth = 3;
      ctx.stroke();
      //10mライン
      ctx.beginPath();
      ctx.moveTo(ground_leftRight,244); ctx.lineTo(can_width - ground_leftRight,244);
      ctx.moveTo(ground_leftRight,336); ctx.lineTo(can_width - ground_leftRight,336);

      //5m点線
      ctx.moveTo(60 / 440 * can_width,103); ctx.lineTo(60 / 440 * can_width,479);
      ctx.moveTo(380 / 440 * can_width,103); ctx.lineTo(380 / 440 * can_width,479);
      ctx.moveTo(120 / 440 * can_width,103); ctx.lineTo(120 / 440 * can_width,479);
      ctx.moveTo(320 / 440 * can_width,103); ctx.lineTo(320 / 440 * can_width,479);
      ctx.setLineDash([8, 10]);
      ctx.stroke();

      ctx.setLineDash([]);
    },
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.moveAtMarker);
  },
}
</script>

<style scoped>
  body {
  margin: 0;
  padding: 0;
  font-family: 'Arial', sans-serif;
}

#container {
  display: flex;
  user-select: none;
  margin: 5px;
}

#board {
  position: relative;
  width: 750px;
  height: 580px;
}

#ground {
  position: absolute;
  z-index: 5;
  background-color: rgb(12, 211, 12);
}

#canvas {
  position: absolute;
  z-index: 20;
  background-color: transparent;
  cursor: crosshair;
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

.rightElements {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

#logout-container {
  display: flex;
  justify-content: flex-end;
}

.button, .bt-samp78 {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
  border-radius: 4px;
}

.button:hover, .bt-samp78:hover {
  background-color: #45a049;
}

.select-box {
  appearance: none;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  width: 100%;
  font-size: 16px;
  color: #333;
}

.select-box:focus {
  outline: none;
  border-color: #4CAF50;
}

#logout {
  background-color: #f44336;
}

#logout:hover {
  background-color: #d32f2f;
}

.buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.left-buttons {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-left: 8px;
}

.select-wrap {
  display: flex;
  height: 44px;
  width: 200px;
}

.player-button-wrap {
  margin-top: 30px;
  margin-left: 8px;
  width: 100%;
  min-width: 180px;
}

.toggle_options {
  margin-top: 30px;
  display: flex;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: center;
}

.add-btn {
  background-color: #2196F3;
}

.add-btn:hover {
  background-color: #1976D2;
}

.clear {
  background-color: #ff9800;
}

.clear:hover {
  background-color: #f57c00;
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

/* ラジオボタンのカスタムスタイル */
.label {
  display: flex;
  align-items: center;
  margin: 10px 0;
  cursor: pointer;
  position: relative;
  padding-left: 35px;
  user-select: none;
}

.label input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-radio {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.label:hover input ~ .custom-radio {
  background-color: #ccc;
}

.label input:checked ~ .custom-radio {
  background-color: #4CAF50;
}

.custom-radio:after {
  content: "";
  position: absolute;
  display: none;
  top: 9px;
  left: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

.label input:checked ~ .custom-radio:after {
  display: block;
}

.label-text {
  font-size: 16px;
  color: #333;
  margin-left: 10px;
}

.delete {
  margin-left: auto;
  color: #f44336;
  cursor: pointer;
  transition: color 0.3s ease;
}

.delete:hover {
  color: #d32f2f;
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

.hidden {
  display: none;
}

</style>
