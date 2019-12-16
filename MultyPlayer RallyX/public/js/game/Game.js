/**
 * @fileoverview This is a class encapsulating the client side of the game,
 *   which handles the rendering of the lobby and game and the sending of
 *   user input to the server.
 */
/**
 * Creates a Game on the client side to render the players and entities.
 * @constructor
 * @param {Object} socket The socket connected to the server.
 * @param {Drawing} drawing The Drawing object that will render the game.
 */
function Game(socket, drawing) {
  this.socket = socket;
  this.drawing = drawing;

  this.canvasWidth=this.drawing.context.canvas.width;
  this.canvasHeight=this.drawing.context.canvas.height;
  this.canvasWidthHalf=this.canvasWidth/2;
  this.canvasHeightHalf=this.canvasHeight/2;

  this.selfPlayer = null;
  this.otherPlayers = [];
  this.animationFrameId = 0;
  this.flags=[];
  this.opponents=[];


  var config = {
    audio: {
        disableWebAudio: true
    }
  };

  var g={
    events:{
      on:function(){},
      once:function(){}
    },
    cache:{
      json:{
        "resources": [
          "assets/sound/theme.mp3"]
      }
    }
  }

}

/**
 * Factory method to create a Game object.
 * @param {Object} socket The Socket connected to the server.
 * @param {Element} canvasElement The canvas element that the game will use to
 *   draw to.
 * @return {Game}
 */
Game.create = function(socket, canvasElement) {
  canvasElement.width = document.documentElement.clientWidth;
  canvasElement.height = document.documentElement.clientHeight;
  // //MAKE IT SQUARE
  // if (canvasElement.width>canvasElement.height)
  //   canvasElement.width=canvasElement.height;
  // else
  //   canvasElement.height=canvasElement.width;
  var canvasContext = canvasElement.getContext('2d');

  var drawing = Drawing.create(canvasContext,1);

  return new Game(socket, drawing);
};

/**
 * Initializes the Game object and its child objects as well as setting the
 * event handlers.
 */
Game.prototype.init = function() {
  var context = this;
  this.socket.on('update', function(data) {
    context.receiveGameState(data);
  });
  this.socket.on('updateFlags', function(data) {
    //console.log("FLAGS:")
    soundFlag.play();
    this.flags=data;
    //console.log(this.flags)
    //context.receiveGameState(data);
  }.bind(this));
  this.socket.on('updateMap', function(data,zoom,mPlayers) {
    this.zoom=zoom;
    console.log("mPlayers:" + mPlayers);
    //console.log("ZOOM" + this.zoom)
    document.all("messages").innerHTML+="updateMap<br>";
    this.map=data;

    var canvasElement2=document.createElement("canvas");
    canvasElement2.width = 24*this.map.mapWidth*zoom;
    canvasElement2.height = 24*this.map.mapHeight*zoom;
    this.canvasWidth2=24*this.map.mapWidth*zoom;
    this.canvasHeight2=24*this.map.mapHeight*zoom;
    this.canvasWidthDiff=this.canvasWidth2-this.canvasWidth;
    this.canvasHeightDiff=this.canvasHeight2-this.canvasHeight;

    this.drawing = Drawing.create(this.drawing.context,zoom);
  
    var canvasContext2 = canvasElement2.getContext('2d');
    document.all("messages").innerHTML+="Map Width:" + this.canvasWidth2 + "<br>";
    document.all("messages").innerHTML+="Map Height:" + this.canvasHeight2 + "<br>";
    this.drawing2 = Drawing.create(canvasContext2,zoom);
  
    for (let x = 0; x < this.map.mapWidth; x++) {
      for (let y = 0; y < this.map.mapHeight; y++) {
        this.drawing2.drawTerrain(x,y, this.map.map[y*this.map.mapWidth+x] );
      }
    }
    document.all("messages").innerHTML+="builtMap<br>";
    //context.receiveGameState(data);
  }.bind(this));
  this.socket.emit('player-join');
};

/**
 * This method begins the animation loop for the game.
 */
Game.prototype.animate = function() {
  this.animationFrameId = window.requestAnimationFrame(
      Util.bind(this, this.update));
};

/**
 * This method stops the animation loop for the game.
 */
Game.prototype.stopAnimation = function() {
  window.cancelAnimationFrame(this.animationFrameId);
};

/**
 * Updates the game's internal storage of all the powerups, called each time
 * the server sends packets.
 * @param {Object} state The game state received from the server.
 */
Game.prototype.receiveGameState = function(state) {
  this.selfPlayer = state['self'];
  this.otherPlayers = state['players'];
  this.opponents= state['opponents'];
  this.highScore=state['highscore'];
};

/**
 * Updates the state of the game client side and relays intents to the
 * server.
 */
Game.prototype.update = function() {
  if (this.selfPlayer) {
    // Emits an event for the containing the player's input.
    this.socket.emit('player-action', {
      keyboardState: {
        left: Input.LEFT,
        right: Input.RIGHT,
        up: Input.UP,
        down: Input.DOWN
      }
    });
    this.draw();
  }
  this.animate();
};

/**
 * Draws the state of the game using the internal Drawing object.
 */
Game.prototype.draw = function() {
  // Clear the canvas.
var dx=0;
var dy=0;
dy=-this.selfPlayer.y+this.canvasHeightHalf;
dx=-this.selfPlayer.x+this.canvasWidthHalf;
if (dx>0)
  dx=0;
if (dx+this.canvasWidthDiff<0)
  dx=-this.canvasWidthDiff;
if (dy>0)
  dy=0;
if (dy+this.canvasHeightDiff<0)
  dy=-this.canvasHeightDiff;

  if (this.selfPlayer.destroyed)
  {
    if (!this.soundBangPlaying){
      soundTheme.stop();
      soundBang.play();
      this.soundBangPlaying=true;
      this.soundThemePlaying=false;
    }
  }
  else
    this.soundBangPlaying=false;

  if (!this.soundThemePlaying){
    if (this.selfPlayer.vx+this.selfPlayer.vy!=0)
    {
      soundIntro.stop();
      soundTheme.play();
      this.soundThemePlaying=true;
    }
  }
  
  this.drawing.context.drawImage(this.drawing2.context.canvas,dx,dy);
// Draw player
  this.drawing.drawSelf(
    this.selfPlayer.x+dx,
    this.selfPlayer.y+dy,
    this.selfPlayer.hitbox,
    this.selfPlayer.newDirection,
    this.selfPlayer.destroyed
  );

  var y=30;
  this.drawing.context.save();
  this.drawing.context.fillStyle="yellow";
  this.drawing.context.fillText("HIGHSCORE: " + this.highScore,10,y);
  this.drawing.context.fillStyle="blue";
  y+=40;
  this.drawing.context.fillText("MY SCORE: " + this.selfPlayer.score,10,y);
  y+=40;
  this.drawing.context.fillStyle="black";
  // Draw the other players
  for (var player of this.otherPlayers) {
    this.drawing.drawOther(
      player.x+dx,
      player.y+dy,
      player.hitbox,
      player.newDirection,
      player.destroyed
    );
    this.drawing.context.fillText("SCORES: " + player.score,10,y);
    y+=30;
  }
  this.drawing.context.restore();

  for(var flag of this.flags)
  {
    this.drawing.drawFlag(flag.x+dx,flag.y+dy,10);
  }
  for(var opponent of this.opponents)
  {
    this.drawing.drawOpponent(opponent,opponent.x+dx,opponent.y+dy);
  }
};