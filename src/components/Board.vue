<template>
  <div id="app">
    <div id="container">
      <div id="piece">
        <select id="color">
          <option value="white" style="background-color:white;color:black" selected>white</option>
          <option value="red" style="background-color:red;color:black">red</option>
          <option value="blue" style="background-color:blue;color:black">blue</option>
          <option value="yellow" style="background-color:yellow;color:black">yellow</option>
        </select>
      </div>
      <canvas id="canvas" width="660" height="580"></canvas>
      <div class="buttons">
        <div @click="logout()" class="button">ログアウト</div>
        <div class="clearWrap">
          <div @click="clearPlayer()" class="button clear">plalyer_clear</div>
          <div @click="cleardrawPath()" class="button clear" id="paint">paint_clear</div>
        </div>
        <div @click="scrum()" class="button" id="paint">scrum</div>
        <div @click="openModal()" class="button" id="paint">登録</div>
        <div @click="customPlacement()" class="button" id="paint">配置</div>
        <div @click="testMove()" class="button" id="paint">testMove</div>
        <template v-for="(position, index) in positions">
          <div class="label" :key="`third-${index}`">
            <input type="radio" :id="index" v-model="selectPosition" name="selectPosition" :value="position.name" :key="`second-${index}`">
            <label :for="index" :id="index" :key="`label-${index}`">{{ position.name }}</label>
            <div class="delete" :key="`first-${index}`" @click="deletePosition(position.name)">[×]</div>
          </div>
        </template>
      </div>
    </div>
    <div v-for="player in players[0]" :key="player.id" class="player my-team drawPlayer">{{ player.number }}</div>
    <div v-for="player in players[1]" :key="player.id" class="player opponent drawPlayer">{{ player.number }}</div>
    <img src="ball.png" class="player ball drawPlayer">
    <section
      v-if="modal"
      id="sendModal"
      class="modal"
    >
      <div class="modalBody">
        <p>配置の名前を入力してください。</p>
        <input type="text" v-model="inputPosition">
        <div id=sendError></div>
      </div>
      <div class="modalFootter">
        <div
          class="register"
          @click="testPost"
        >登録</div>
      </div>
    </section>
    <div
      v-if="mask"
      id="mask"
      class="hidden"
      @click="closeModal"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      players: [],
      teams: [
        {name: 'my-team'},
        {name: 'opponent'},
        {name: 'ball'}
      ],
      // positions: [],
      inputPosition: '',
      selectPosition: '',
      flagDraw: false,
      mask: false,
      modal: false,
      drawPath: [],
      count: 0,
    }
  },
  watch: {
    state() {

    }
  },
  computed: {
    positions() {
      return this.$store.getters.positions;
    }
  },
  created() {
    this.createPlayers();
  },
  mounted() {
    this.startDraw = this.startDraw.bind(this);
    let gX = 0;
    let gY = 0;
    let gColor = 'white';
    const canvas = document.getElementById('canvas');
    //↓要素の左のwidth
    // console.log(canvas.getBoundingClientRect().left);
    const ctx = canvas.getContext('2d');
    // const drawPath = [];
    this.placement();
    this.drawAgain(ctx);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    canvas.addEventListener('mousedown', startDraw.bind(this), false);
    canvas.addEventListener('mousemove', Draw.bind(this), false);
    canvas.addEventListener('mouseup', endDraw.bind(this), false);
    let s = document.getElementById('color');
    s.addEventListener('change', changeColor, false);

    function changeColor(){
      gColor = document.getElementById('color').value;
    }
    function startDraw(e){
      let players = document.getElementsByClassName('player');
      players.forEach(player => {
        player.classList.remove('drawPlayer');
      });
      this.flagDraw = true;
      gX = e.offsetX;
      gY = e.offsetY;
    }

    function Draw(e){
      if (this.flagDraw == true){
        const canvas = document.getElementById('canvas');
        const con = canvas.getContext('2d');

        let x = e.offsetX;
        let y = e.offsetY;

        // 線のスタイルを設定
        con.lineWidth = 2;
        // 色設定
        con.strokeStyle = gColor;
        // 描画開始
        con.beginPath();
        con.moveTo(gX, gY); con.lineTo(x, y);
        con.closePath();
        con.stroke();
        let coordinates = {
          gx: gX,
          gy: gY,
          x: x,
          y: y,
          color: gColor
        }
        // 次の描画開始点
        gX = x;
        gY = y;
        this.drawPath.push(coordinates);
      }
    }
    // 描画終了
    function endDraw(){
      let players = document.getElementsByClassName('player');
      players.forEach(player => {
        player.classList.add('drawPlayer');
      });
      this.flagDraw = false;
      setdrawPath(this.drawPath);
    }

    function setdrawPath(drawPath) {
      localStorage.setItem('drawPath', JSON.stringify(drawPath));
    }

    let teams = this.teams

    teams.forEach((team, i) => {
      let players = document.getElementsByClassName(team.name);
      players.forEach((player, index) => {
        player.style.position = 'absolute';
        player.style.left = this.players[i][index].x + 'px';
        player.style.top = this.players[i][index].y + 'px';
        player.style.zIndex = this.players[i][index].zIndex;
        player.addEventListener('mousedown', event => {

          let shiftX = event.clientX - player.getBoundingClientRect().left;
          let shiftY = event.clientY - player.getBoundingClientRect().top;

          // player.style.zIndex = 1000;
          this.setZIndex(players, i, index);

          moveAt(event.pageX, event.pageY, index);

          // ボールを（pageX、pageY）座標の中心に置く
          function moveAt(pageX, pageY) {
            // this.test1();
            player.style.left = pageX - shiftX + 'px';
            player.style.top = pageY - shiftY + 'px';
          }
          function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
          }

          // (3) mousemove でボールを移動する
          document.addEventListener('mousemove', onMouseMove);

          // (4) ボールをドロップする。不要なハンドラを削除する
          player.addEventListener('mouseup', e => {
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
    startDraw() {

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
      console.log(this.count);
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
    customPlacement() {
      this.positions.forEach(position => {
        if (position.name == this.selectPosition) {
          const newPosition = Object.values(position.position);
          // const testPosition = [];
          this.players.length = 0;
          newPosition.forEach(value => {
            let clonePosition = Object.values(value);
            // testPosition.push(clonePosition);
            this.players.push(clonePosition);
          });
          // console.log(testPosition);
          this.rellocation();
        }
      });

    },
    createPlayers() {
      for (let j = 0; j < 2; j++) {
        let players = [];
        for (let i = 1; i <= 15; i++) {
          let y_clone = 30 * i;
          let player = {
            x: 50 * (j + 1),
            y: y_clone,
            number: i,
            zIndex: i * 10 + j * 150
          }
          players.push(player);
        }
        this.players.push(players);
      }
      let ball = [{
        x: 48,
        y: 485,
        number: 0,
        zIndex: 310
      }];
      this.players.push(ball);
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
      const clone_drawPath = JSON.parse(localStorage.getItem('drawPath'));
      if (clone_drawPath) {
        clone_drawPath.forEach(coordinates => {
          ctx.strokeStyle = coordinates.color;
          ctx.beginPath();
          ctx.moveTo(coordinates.gx, coordinates.gy);
          ctx.lineTo(coordinates.x, coordinates.y);
          ctx.closePath();
          ctx.lineWidth = 2;
          ctx.stroke();
          this.drawPath.push(coordinates);
        });
      }
    },
    setDrawPath(drawPath) {
      localStorage.setItem('drawPath', JSON.stringify(drawPath));
    },
    cleardrawPath() {
      localStorage.removeItem('drawPath');
      this.drawPath = [];
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 660, 580);
      this.drawGround();
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
      players[index].style.zIndex = 310;
    },
    clearPlayer() {
      this.players = [];
      this.createPlayers();
      this.rellocation();
      localStorage.removeItem('players');
      // window.location.reload();
    },
    rellocation() {
      let teams = this.teams
      teams.forEach((team, i) => {
        let players = document.getElementsByClassName(team.name);
        players.forEach((player, index) => {
          player.style.position = 'absolute';
          player.style.left = this.players[i][index].x + 'px';
          player.style.top = this.players[i][index].y + 'px';
          player.style.zIndex = this.players[i][index].zIndex;
        });
      });
      localStorage.setItem('players', JSON.stringify(this.players));
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
      this.mask = false;
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
    drawGround() {
      const canvas = document.getElementById('canvas');
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
  }
}
</script>

<style scoped>
  body {
    /* height: 100%; */
    margin: 0;
    padding: 0;
    /* cursor: grab; */
  }
  canvas {
  background-color: rgb(12, 211, 12);
  z-index: 5;
}
  #img {
    height: 100%;
    text-align: center;
    user-select: none;
    -webkit-user-drag: none;
  }
  #piece {
    height: 100%;
    width: 200px;
  }
  #color {
    margin-top: 5px;
    margin-left: 20px;
  }
  /* #action {
    margin-top: 10px;
    margin-left: 20px;
  } */
  #container {
    display: flex;
    user-select: none;
  }
  #ground {
    height: 100%;
    width: 380px;
    align-content: center;
    user-select: none;
    -webkit-user-drag: none;
  }
  .player , .test {
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

  .drawPlayer:hover {
    cursor: grab;
  }
  .drawPlayer:active {
    cursor: grabbing;
  }

  .test {
    z-index: 1000;
    position: absolute;
    left: 1000px;
    top: 200px;
    background: #000;
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
    color: white;
  }
  .ball {
    /* background: rgb(161, 60, 60);
    color: white; */
    width:30px;                                   /* 横幅のサイズを指定    */
    height:30px;
    border-top-left-radius: 40px;
    border-top-right-radius: 15px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 40px;
    background: none;
  }

  .button {
    border: 1px solid #ccc;
    background: #f1e767;
    background: -webkit-gradient(linear, left top, left bottom, from(#fdfbfb), to(#ebedee));
    background: -webkit-linear-gradient(top, #fdfbfb 0%, #ebedee 100%);
    background: linear-gradient(to bottom, #fdfbfb 0%, #ebedee 100%);
    -webkit-box-shadow: inset 1px 1px 1px #fff;
    box-shadow: inset 1px 1px 1px #fff;
    height: 30px;
    width: 150px;
    margin-top: 20px;
    margin-bottom: 30px;
    margin-left: 30px;
    border-radius: 5px;
    text-align: center;
    line-height: 30px;
    cursor: pointer;
  }
  .clearWrap {
    display: flex;
  }
  #paint {
    top: 100px;
    left: 1000px;
  }

  #mask {
  background: rgba(0, 0, 0, 0.4);
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 2000;
}

.modal {
  background: #fff;
  padding: 0;
  position: fixed;
  border-radius: 5px;
  top: 150px;
  left: 0;
  right: 0;
  margin: 0 auto;
  height: 150px;
  display: flex;
  flex-direction: column;
  z-index: 2500;
}

.modal {
  width: 300px;
  height: 150px;
}

.modalBody {
  height: 100px;
}

.modalBody > input {
  width: auto;
  margin-left: 10px;
}

/* .modalFootter {
  margin-top: 5px;
} */

.modalBody > h1, h2, p {
  margin: 0;
  height: 50px;
  line-height: 50px;
  font-weight: normal;
  border-radius: 5px;
  text-align: center;
}

.modalBody > p {
  font-size: 18px;
  height: auto;
}

.modalFootter {
  height: auto;
  background: #ddd;
  border-radius: 5px;
  align-items: flex-end;
}
.close, .register {
  font-size: 16px;
  color: #fff;
  background: rgb(248, 109, 29);
  height: 30px;
  width: 50px;
  line-height: 30px;
  margin: 10px auto 10px 130px;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;
}

.label {
  margin: 10px 20px;
  height: 20px;
  display: flex;
}

.delete {
  padding-left: 10px;
  cursor: pointer;
  line-height: 20px;
}

.delete:hover, label:hover {
  color: blue;
  opacity: 0.8;
}

label {
  font-size: 20px;
  line-height: 20px;
  cursor: pointer;
}

</style>
