require('dotenv').config();
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var game = require('./game');
var common = require('./public/common');

const PLAYERS_NEEDED=10;

app.use('/',express.static('public/'));

app.use('/public',express.static('public'));

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:' + (process.env.PORT||3000));
});

io.on('connection', function (socket) {
  IO.init(io, socket);
});

//ROOM MANAGEMENT
var ROOMS={
  list:[],
  create:function(roomId, socketId){
    ROOMS.list.push({id:roomId,users:[socketId],status:"WAITING"});
    console.log("EXISTING ROOMS");
    console.log(ROOMS.list)
  },
  addUser:function(roomId,socketId){
    var r=ROOMS.list.find(el=>el.id==roomId);
    if (r){
      r.users.push(socketId);
      //console.log(ROOMS.list)
      return r;
    }
    else
    {
      return false;
    }
  },
  getRoom:function(roomId){
    return ROOMS.list.find(el=>el.id==roomId);
  }
}

var IO={
  init: function(io,socket) {
    console.log('a user connected:' + socket.id);
    //gameSocket = socket;

    socket.on('disconnect', IO.disconnected);
    socket.on('createGame', IO.createGame);
    socket.on('joinGame', IO.joinGame);
    socket.on('rejoinGame', IO.rejoinGame);
    socket.on('changeName', IO.changeName);
    socket.on('chatMessage', IO.chatMessage);
    socket.on('getRandomGame', IO.getRandomGame);
    socket.on('startGame', IO.startGame);

    socket.on('playerMoved',IO.playerMoved);
    socket.on('playerMovedToCollect',IO.playerMovedToCollect);
  },

  getRandomGame:function(userName){
    //TODO: FIND AVAILABLE GAME IN WAITING LIST
    var room=ROOMS.list.find(el=>el.status=="WAITING");
    if (room){
      var roomID=room.id;
      var room=ROOMS.addUser(roomID,this.id);
      if (room){
        console.log("joined:" + roomID);
        this.join("R-" + roomID);
        this.emit("getRandomGame",roomID);
  
        joinGameCore(roomID,this.id,room,userName);
      }
      // io.to("R-" + room.id).emit('joinedGame', this.id );
      // this.emit('getRandomGame',room.id);
    }
  },
  disconnected:function(){
    console.log('user disconnected: ' + this.id);
  },
  createGame:function(msg){
    var newID=Math.floor(Math.random()*100000);
    console.log("created:" + newID);
    //INITROOM
    ROOMS.create(newID,this.id);
    this.join("R-" + newID);
    this.emit("newID",newID)
    this.emit('chatMessage', message("room " + newID + " created",2));
    GAME.start(io,newID);
  },
  joinGame:function(roomID,userName){
    console.log("try to join:" + roomID);
    var room=ROOMS.addUser(roomID,this.id);
    if (room){
      console.log("joined:" + roomID);
      this.join("R-" + roomID);

      joinGameCore(roomID,this.id,room,userName);
      // io.to("R-" + roomID).emit('chatMessage', message("user " + this.id + " joined",2));
      // io.to("R-" + roomID).emit('joinedGame', this.id );

      // //CHECK IF #USERS IN THE ROOM IS ENOUGH TO START GAME
      // if (room.users.length==PLAYERS_NEEDED)
      // {
      //   room.status="STARTED";
      //   //GAME START
      //   GAME.start(io,roomID);
      //   io.to("R-" + roomID).emit('gameStartReady');
      // }
    }
    else
    {
      this.emit('chatMessage', message("room " + roomID + " does not exist",1));
    }
  },
  rejoinGame:function(kuk){
    //m - roomId
    //i - socketId
    //u - username
    var roomID=kuk.m;
    console.log("rejoined")
    console.log(kuk);
    console.log("ROOMS.list")
    console.log(ROOMS.list)
    var room=ROOMS.list.find(el=>el.id==roomID);
    //var room=ROOMS.addUser(roomID,this.id);
    if (room){
      console.log("FOUND ROOM")
      var u=room.users.findIndex(el=>el==kuk.i);
      if (u>=0){
        console.log("FOUND USER")
        //USER WAS IN THIS ROOM
        //REMOVEPREVIOUSUSER ID kuk.i and replace it by this.id
        console.log("u")
        console.log(u)
        console.log(room.users)
        room.users[u]=this.id;
        console.log(room.users)
        //SEND THE MESSAGE TO CLIENT TO REDRAW
        //hand[u]
        var G=room.game;
        var m={
          id:roomID,
          h:G.hands[u], 
          b: G.board, 
          p:u, 
          cp:G.currentPlayer, 
          s:G.scores,
          sp:G.spaces, 
          np:G.nPlayers,
          w:G.win,
          status:room.status
        }
  console.log("M")
  console.log(m)
        this.emit("redraw",m);

        this.join("R-" + roomID);
        io.to("R-" + roomID).emit('chatMessage', message(kuk.u + " rejoined",2));
      }
      else
      {
        this.emit('chatMessage', message("room " + roomID + " does not exist anymore",1));
      }
    }
    else
    {
      this.emit('notvalidroom');
    }
  },
  changeName:function(name){
    console.log("changedName:" + name);
  },
  chatMessage:function(msg){
    console.log(this.rooms)
    for (const key in this.rooms) {
      if (this.rooms.hasOwnProperty(key)) {
        if (key.startsWith("R-")){
          io.to(key).emit('chatMessage', message(msg));
          return;
        }
        
      }
    }
  },
  playerMoved:function(move){
    console.log("playerMoved");
    console.log(move);
    var r=ROOMS.list.find(el=>el.id==move.roomID);
    if (r){
      var player=r.users.findIndex(el=>el==this.id);
      var possible=common.possibleMoves(r.game.hands[player][move.from],r.game.board);
      if (possible){
        if (possible.row==move.to){
          common.playFromTo(move.from,move.to, r.game.hands[player],r.game.board);
          //TO DO: Set next player 
          var res=common.nextPlayer(r.game.currentPlayer,r.game.nPlayers, r.game.hands,r.game.scores);
          r.game.currentPlayer=res.currentPlayer;
          r.game.win=res.winScore;

          var G=r.game;
          var m={
            id:move.roomID,
            b: G.board, 
            cp:G.currentPlayer, 
            s:G.scores,
            w:G.win,
            lastMove:{from:move.from,to:move.to}
          }

          io.to("R-" + move.roomID).emit('playerMoved', m);
          return;
        }
      }

    }
    else
    {
      console.log("ERROR01:ROOM NOT FOUND-" + move.roomID);
    }
  },
  playerMovedToCollect:function(move){
    console.log("playerMovedToCollect");
    console.log(move);
    //VALIDATE MOVE
    //SEND IT TO OTHER PLAYERS
    var r=ROOMS.list.find(el=>el.id==move.roomID);
    if (r){
      console.log("found room");
      var player=r.users.findIndex(el=>el==this.id);
      // var possible=common.possibleMoves(r.game.hands[player][move.from],r.game.board);
      // if (!possible){
        console.log("moving");
        var row=move.to;
        //SET SCORE
        var totalScore=0;
        for(let i=0;i<r.game.board[row].length;i++)
        {
          totalScore+=r.game.board[row][i].cattle;
        }
        r.game.scores[player]+=totalScore;

        r.game.board[row]=[];
        common.playFromTo(move.from,move.to, r.game.hands[player],r.game.board);

          //TO DO: Set next player 
          var res=common.nextPlayer(r.game.currentPlayer,r.game.nPlayers, r.game.hands,r.game.scores);
          r.game.currentPlayer=res.currentPlayer;
          r.game.win=res.winScore;

          var G=r.game;
          var m={
            id:move.roomID,
            b: G.board, 
            cp:G.currentPlayer, 
            s:G.scores,
            w:G.win,
            lastMove:{from:move.from,to:move.to}
          }

          io.to("R-" + move.roomID).emit('playerMovedToCollect', m);
          return;

          
      //}

    }
    else
    {
      console.log("ERROR02:POSSIBLE MOVES-" + move.roomID);
    }

  },
  startGame:function(roomID,userName){
    var room=ROOMS.list.find(el=>el.id==roomID);
    //var room=ROOMS.addUser(roomID,this.id);
    if (room){
      io.to("R-" + roomID).emit('chatMessage', message(userName + " started the game",1));
      room.status="STARTED";
      GAME.start(io,roomID);
      io.to("R-" + roomID).emit('gameStartReady');
    }
  }
}

function joinGameCore(roomID,userSocketId,room,userName){
  io.to("R-" + roomID).emit('chatMessage', message(userName + " joined",2));
  io.to("R-" + roomID).emit('joinedGame', userName );

  //CHECK IF #USERS IN THE ROOM IS ENOUGH TO START GAME
  if (room.users.length==PLAYERS_NEEDED)
  {
    room.status="STARTED";
    //GAME START
    GAME.start(io,roomID);
    io.to("R-" + roomID).emit('gameStartReady');
  }
}


var GAME={
  start:function(io,roomID){
    var R=ROOMS.getRoom(roomID);

    var G=new game();
    G.init(R.users.length);
    console.log(G.hands);
    console.log(G.board);

    R.game=G;

    console.log(R);

    for (let index = 0; index < R.users.length; index++) {
      const player = R.users[index];
      
      var m={
        id:roomID,
        h:G.hands[index], 
        b: G.board, 
        p:index, 
        cp:G.currentPlayer, 
        s:G.scores,
        sp:G.spaces, 
        np:R.users.length,
        w:G.win
      }

      io.to(player).emit('gameStart',m);
    }

  }
}

function message(m,msgType){
  return {t:m,e:msgType||0};
}