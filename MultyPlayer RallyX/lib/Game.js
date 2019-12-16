/**
 * @fileoverview This class encapsulates an active game on the server and
 *   handles game updates.
 * @author alvin@omgimanerd.tech (Alvin Lin)
 */

const HashMap = require('hashmap');
const Player = require('./Player');
const Util = require('../shared/Util');
const Flag = require('./Flag');
const Opponent = require('./Opponent');
const TileMap = require('./TileMap.js');

const FLAG_TOTAL=10;
const OPPONENT_TOTAL=5;
var flags=[];
var opponents=[];
var HighScore=0;
var maxPlayers=0;

/**
 * Constructor for a Game object.
 * @constructor
 */
function Game() {
  this.zoom=3;
  this.zoom16=16*this.zoom;
  this.zoom24=24*this.zoom;
  this.zoomDif1624half=this.zoom16/2-this.zoom24/2;
  this.zoomSum1624half=this.zoom16/2+this.zoom24/2;
  this.zoom24square=this.zoom24*this.zoom24;
  this.clients = new HashMap();
  this.players = new HashMap();
  this.map= new TileMap("",1);

  for (let index = 0; index < FLAG_TOTAL; index++) {
    var x,y,t;
    do{
      x=Math.round(Math.random()*this.map.mapWidth);
      y=Math.round(Math.random()*this.map.mapHeight);
      t=this.map.isOccupied(x,y);
    } while(t!=0)   
    flags.push(new Flag(index,x*24*this.zoom,y*24*this.zoom, this.zoom16));
  }
  for (let index = 0; index < OPPONENT_TOTAL; index++) {
    var op=new Opponent(index, (index*2+16)*24*this.zoom, 59*24*this.zoom, this.zoom16);
    opponents.push(op);
  }
}

/**
 * Factory method for a Game object.
 * @return {Game}
 */
Game.create = function() {
  return new Game();
};

/**
 * Returns a list containing the connected Player objects.
 * @return {Array<Player>}
 */
Game.prototype.getPlayers = function() {
  return this.players.values();
};

/**
 * Returns callbacks that can be passed into an update()
 * method for an object so that it can access other elements and
 * entities in the game.
 * @return {Object<string, Function>}
 */
Game.prototype._callbacks = function() {
  return {
    players: Util.bind(this, this.players)
  };
};

Game.prototype.addNewPlayer = function(socket, data) {
  this.clients.set(socket.id, socket);
  this.players.set(socket.id, Player.create(socket.id, 20*24*this.zoom, 53*24*this.zoom, this.zoom16, 0));
  this.clients.get(socket.id).emit('updateFlags', flags);
  if (this.players.values().length>maxPlayers)
    maxPlayers=this.players.values().length;
  this.clients.get(socket.id).emit('updateMap',this.map,this.zoom,maxPlayers);
};

Game.prototype.removePlayer = function(id) {
  this.clients.remove(id);
  this.players.remove(id);
}

/**
 * Updates a player based on input received from their client.
 * @param {string} id The socket ID of the client
 * @param {Object} data The input received from the client
 */
Game.prototype.updatePlayerOnInput = function(id, data) {
  var player = this.players.get(id);
  if (player) {
    player.updateOnInput(data.keyboardState);
  }
}

/**
 * Steps the server forward in time. Updates every entity in the game.
 */
Game.prototype.update = function() {
  var players = this.getPlayers();
  //Player collision with other players, with flags and walls
  for (var i = 0; i < players.length; ++i) {
    var prevX=players[i].x;
    var prevY=players[i].y;
    if (!players[i].destroyed)
    {
      players[i].update();

      if (players[i].vx+players[i].vy!=0){

        for (let j = 0; j < i; j++) {
          if (players[j].isCollidedWith(players[i]) && players[j].vx+players[j].vy!=0){
            //crash player
            players[j].vx=0;
            players[j].vy=0;
            players[j].destroyed=true;
            players[j].score=0;
            players[j].destroyedCountdown=0;

            players[i].vx=0;
            players[i].vy=0;
            players[i].destroyed=true;
            players[i].score=0;
            players[i].destroyedCountdown=0;

            break;
          }
        }
      }

      //#region Capture Flag
      var bFlagUpdate=false;
      //check capture Flags
      for (let index = 0; index < FLAG_TOTAL; index++) {
        if (players[i].isCollidedWith(flags[index])){
          console.log("HIT FLAG " + index);
          players[i].score+=10;
          if (players[i].score>HighScore)
            HighScore=players[i].score;
          var x,y,t;
          do{
            x=Math.round(Math.random()*this.map.mapWidth);
            y=Math.round(Math.random()*this.map.mapHeight);
            t=this.map.isOccupied(x,y);
          } while(t!=0)   
          flags[index]=new Flag(index,x*24*this.zoom,y*24*this.zoom,this.zoom16);
          bFlagUpdate=true;
        }
      }
      if (bFlagUpdate){
        var ids = this.clients.keys();
        for (var ii = 0; ii < ids.length; ++ii) {
          this.clients.get(ids[ii]).emit('updateFlags', flags);
        }
      }
      //#endregion

      //check player collision with walls
      var px=Math.floor(players[i].x/this.zoom24);
      var py=Math.floor(players[i].y/this.zoom24);
      var px1=Math.floor((players[i].x+this.zoom16)/this.zoom24);
      var py1=Math.floor((players[i].y+this.zoom16)/this.zoom24);
      if (this.map.isOccupied(px,py) || this.map.isOccupied(px1,py1)){
        if (Math.random()>0.5)
          players[i].newDirection++;
        else
          players[i].newDirection--;
        if (players[i].newDirection>3)
          players[i].newDirection=0;
        if (players[i].newDirection<0)
          players[i].newDirection=3;
        var velocity=VelocityFromDirection(players[i].newDirection);
        players[i].vx=300*velocity.vx;
        players[i].vy=300*velocity.vy;
    
        players[i].x=prevX;
        players[i].y=prevY;
      }

    }

  }

  //ALL OPPONENTS
  for (var i = 0; i < opponents.length; ++i) {
    var prevX=opponents[i].x;
    var prevY=opponents[i].y;
    opponents[i].update();

    var bCollide=false;

    //CHECK COLLISION WITH PLAYERS
    for(var j=0;j<players.length;++j){
      if (players[j].destroyed)
      {
        players[j].destroyedCountdown++;
        if (players[j].destroyedCountdown>60*10){
          players[j].destroyed=false;
          players[j].x=20*24*this.zoom;
          players[j].y=53*24*this.zoom;
          players[j].direction=1;
        }
      }
      else
      {
        if (players[j].isCollidedWith(opponents[i]) && players[j].vx+players[j].vy!=0){
          //crash player
          players[j].vx=0;
          players[j].vy=0;
          //KILL PLAYER
          players[j].destroyed=true;
          players[j].score=0;
          players[j].destroyedCountdown=0;
          bCollide=true;
          break;
        }
      }
    }


    //CHECK COLLISION
    var px=Math.floor(opponents[i].x/this.zoom24);
    var py=Math.floor(opponents[i].y/this.zoom24);
    var px1=Math.floor((opponents[i].x+this.zoom16)/this.zoom24);
    var py1=Math.floor((opponents[i].y+this.zoom16)/this.zoom24);

    if (this.map.isOccupied(px,py) || this.map.isOccupied(px1,py1)){
      bCollide=true;
    }
    //COLLISION WITH OPPONENTS
    for (var j=0;j<i;++j)
    {
      if (opponents[i].isCollidedWith(opponents[j])){
        bCollide=true;
        break;
      }
    }

    if (bCollide){
      if (Math.random()>0.5)
        opponents[i].newDirection++;
      else
        opponents[i].newDirection--;
      if (opponents[i].newDirection>3)
        opponents[i].newDirection=0;
      if (opponents[i].newDirection<0)
        opponents[i].newDirection=3;
      var velocity=VelocityFromDirection(opponents[i].newDirection);
      opponents[i].vx=300*velocity.vx;
      opponents[i].vy=300*velocity.vy;
  
      opponents[i].x=prevX;
      opponents[i].y=prevY;
    }
    else
    {
      if (opponents[i].dontChangeCounter==null)
        opponents[i].dontChangeCounter=0;
      
      opponents[i].dontChangeCounter++;
      if (opponents[i].dontChangeCounter>30)
      {
        opponents[i].dontChangeCounter=0;
        if (Math.random()>.5){
          //find nearest player
          var dPlayer=9999999999;
          var nearestPlayer=-1;
          for(var j=0;j<players.length;++j){
            const d=(opponents[i].x-players[j].x)*(opponents[i].x-players[j].x)+(opponents[i].y-players[j].y)*(opponents[i].y-players[j].y);
            if (d<dPlayer){
              dPlayer=d;
              nearestPlayer=j;
            }
          }

          //IF NOT COLLIDING, CAN CHANGE HIS DIRECTION
          var dy=Math.sign(opponents[i].vx);
          var dx=Math.sign(opponents[i].vy);
          //GETTING THE PERPENDICULAR BOTH WAYS
          var px1=px+dx;
          var py1=py+dy;
          var bd1=this.map.isOccupied(px1,py1);
          //CHECK IF IT'S OCCUPIED
          px1=px-dx;
          py1=py-dy;
          var bd2=this.map.isOccupied(px1,py1);
          //CHECK IF IT'S OCCUPIED
          if ((!bd1 || !bd2) && nearestPlayer!=-1)
          {
            //console.log(bd1 + "," + bd2)
            if(!bd1 && !bd2){
              var b1=false;
              if (Math.random()>.5)
                b1=true;
              if (players[nearestPlayer].x<opponents[i].x)
              {
                if (opponents[i].vy<0)
                {
                  b1=true;
                }
                if (players[nearestPlayer].y> opponents[i].y && opponents[i].vx>0){
                  b1=true;
                }
                if (players[nearestPlayer].y< opponents[i].y && opponents[i].vx>0){
                  b1=false;
                }
              }
              if (players[nearestPlayer].x>opponents[i].x)
              {
                if (opponents[i].vy>0)
                {
                  b1=true;
                }
                if (players[nearestPlayer].y> opponents[i].y && opponents[i].vx>0){
                  b1=true;
                }
                if (players[nearestPlayer].y< opponents[i].y && opponents[i].vx>0){
                  b1=false;
                }
              }
              //random


              if (b1){
                px=opponents[i].vx;
                opponents[i].vx=opponents[i].vy;
                opponents[i].vy=px;
              }
              else
              {
                px=opponents[i].vx;
                opponents[i].vx=-opponents[i].vy;
                opponents[i].vy=-px;
              }
            }
            else
              if (!bd1){
                //turn bd1
                px=opponents[i].vx;
                opponents[i].vx=opponents[i].vy;
                opponents[i].vy=px;
              }
              else
              {
                //turn bd2
                px=opponents[i].vx;
                opponents[i].vx=-opponents[i].vy;
                opponents[i].vy=-px;
              }

            if (opponents[i].vx>0)
              opponents[i].newDirection=2;
            else if (opponents[i].vx<0)
              opponents[i].newDirection=0;
            else if (opponents[i].vy<0)
              opponents[i].newDirection=1;
            else
              opponents[i].newDirection=3;
          }

        }

      }
    }
  }
};

/**
 * Sends the state of the game to every client.
 */
Game.prototype.sendState = function() {
  var ids = this.clients.keys();
  for (var i = 0; i < ids.length; ++i) {
    this.clients.get(ids[i]).emit('update', {
      self: this.players.get(ids[i]),
      players: this.players.values().filter((player) => player.id != ids[i]),
      opponents: opponents,
      highscore:HighScore
    });
  }
};

function VelocityFromDirection(direction){
  var velocity;
  switch (direction) {
    case 0:
      velocity={vx:-1,vy:0};
      break;
    case 1:
      velocity={vx:0,vy:-1};
      break;
    case 2:
      velocity={vx:1,vy:0};
      break;
    case 3:
      velocity={vx:0,vy:1};
      break;
    default:
      throw "Unknown direction";
      break;
  }    
  return velocity;
}

module.exports = Game;
