function data() {
  return {
    canvas: null,
    context: null,
    isDrag: false,
  }
}

function mounted() {
  this.placement();
  this.canvas = document.getElementById('canvas');
  this.context = this.canvas.getContext('2d');
  this.context.lineCap = 'round';
  this.context.lineJoin = 'round';


  let gX = 0;
  let gY = 0;
  const canvas = document.getElementById('canvas');
  //↓要素の左のwidth
  // console.log(canvas.getBoundingClientRect().left);
  const ctx = canvas.getContext('2d');
  // const drawPath = [];
  this.placement();
  this.drawAgain2(ctx);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  canvas.addEventListener('mousedown', startDraw.bind(this), false);
  canvas.addEventListener('mousemove', Draw.bind(this), false);
  canvas.addEventListener('mouseup', endDraw.bind(this), false);
  canvas.addEventListener('mouseout', endDraw.bind(this), false);
  // let s = document.getElementById('color');
  // s.addEventListener('change', changeColor, false);

  // function changeColor(){
  //   gColor = this.selectedColor.value;
  // }
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
      // con.lineWidth = this.selectedLineWidth.value;
      con.lineWidth = 60;
      // 色設定
      con.strokeStyle = this.selectedColor.value;

      if (this.selectedColor.value == 'transparent') {
        con.globalCompositeOperation = 'destination-out';
        con.lineWidth = this.selectedLineWidth.value * 10;
        con.strokeStyle = 'white'
        con.beginPath();
        con.moveTo(gX, gY);
        con.lineTo(x, y);
        con.closePath();
        con.stroke();
        gX = x;
        gY = y;
      } else {
        // 描画開始
        con.globalCompositeOperation = 'source-over';
        con.lineCap = 'round';
        con.lineJoin = 'round';
        con.beginPath();
        con.moveTo(gX, gY);
        con.lineTo(x, y);
        con.closePath();
        con.stroke();
        let coordinates = {
          gx: gX,
          gy: gY,
          x: x,
          y: y,
          color: this.selectedColor.value,
          style: this.selectedLineWidth.value,
        }
        // 次の描画開始点
        gX = x;
        gY = y;
        this.drawPath.push(coordinates);
      }

    }
  }
  // 描画終了
  function endDraw(){
    let players = document.getElementsByClassName('player');
    players.forEach(player => {
      player.classList.add('drawPlayer');
    });
    this.flagDraw = false;
    this.drawPath2.push(this.drawPath.slice());
    setdrawPath(this.drawPath2);
    // console.log(this.drawPath2);
  }

  function setdrawPath(drawPath) {
    localStorage.setItem('drawPath', JSON.stringify(drawPath));
    // console.log(drawPath);
  }
  // console.log(this.teams);
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

}

function drawStart(e) {
  let x = e.layerX;
  let y = e.layerY;

  this.context.beginPath();
  this.context.lineTo(x, y);
  this.context.stroke();

  this.isDrag = true;

}

function draw(e) {
  let x = e.layerX;
  let y = e.layerY;

  if(!this.isDrag) {
    return;
  }

  this.context.lineTo(x, y);
  this.context.stroke();
}

function dragEnd() {
  this.context.closePath();
  this.isDrag = false;
}
