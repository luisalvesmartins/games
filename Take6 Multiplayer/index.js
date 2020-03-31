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
  },
  addUser:function(roomId,socketId){
    var r=ROOMS.list.find(el=>el.id==roomId);
    if (r){
      r.users.push(socketId);
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
    socket.on('addAIPlayer',IO.addAIPlayer);

    socket.on('playerMoved',IO.playerMoved);
    socket.on('playerMovedToCollect',IO.playerMovedToCollect);
    socket.on('admin',IO.adminRoom);
  },
  addAIPlayer:function(roomID){
    console.log("try to join:" + roomID);
    var AIsocketID="AI-" + (Math.random()*10000000)
    var room=ROOMS.addUser(roomID,AIsocketID);
    if (room){
      console.log("AI joined:" + roomID);
      var u=Math.floor(Math.random()*common.names.length);
      var userName=common.names[u] + "[AI]";
      Core.joinGame(roomID,AIsocketID,room,userName);
    }
  },
  getRandomGame:function(userName){
    var room=ROOMS.list.find(el=>el.status=="WAITING");
    if (room){
      var roomID=room.id;
      var room=ROOMS.addUser(roomID,this.id);
      if (room){
        console.log("joined:" + roomID);
        this.join("R-" + roomID);
        this.emit("getRandomGame",roomID);
  
        Core.joinGame(roomID,this.id,room,userName);
      }
      // io.to("R-" + room.id).emit('joinedGame', this.id );
      // this.emit('getRandomGame',room.id);
    }
    else
    {
      //TODO: DIDN'T FIND ROOM, SHOULD PROPOSE TO CREATE ROOM
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
    Core.start(io,newID);
  },
  joinGame:function(roomID,userName){
    console.log("try to join:" + roomID);
    var room=ROOMS.addUser(roomID,this.id);
    if (room){
      console.log("joined:" + roomID);
      this.join("R-" + roomID);

      Core.joinGame(roomID,this.id,room,userName);
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
          status:room.status,
          r:kuk.r
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
    Core.MoveCard(move,this.id);
  },
  playerMovedToCollect:function(move){
    Core.MoveCardToCollect(move,this.id);
  },
  startGame:function(roomID,userName){
    var room=ROOMS.list.find(el=>el.id==roomID);
    //var room=ROOMS.addUser(roomID,this.id);
    if (room){
      io.to("R-" + roomID).emit('chatMessage', message(userName + " started the game",1));
      room.status="STARTED";
      Core.start(io,roomID);
      io.to("R-" + roomID).emit('gameStartReady');
    }
  },
  adminRoom:function(mode,pass){
    if (pass=="12345"){
      if (mode=="CLEAR")
      {
        ROOMS.list=[];
      }
      this.emit("list",ROOMS.list);
    }
  },
}


var Core={
  joinGame:function(roomID,userSocketId,room,userName){
    io.to("R-" + roomID).emit('chatMessage', message(userName + " joined",2));
    io.to("R-" + roomID).emit('joinedGame', userName );
  
    //CHECK IF #USERS IN THE ROOM IS ENOUGH TO START GAME
    if (room.users.length==PLAYERS_NEEDED)
    {
      room.status="STARTED";
      //GAME START
      Core.start(io,roomID);
      io.to("R-" + roomID).emit('gameStartReady');
    }
  },
  MoveCardToCollect:function(move,socketID){
    //VALIDATE MOVE
    //SEND IT TO OTHER PLAYERS
    var r=ROOMS.list.find(el=>el.id==move.roomID);
    if (r){
      var player=r.users.findIndex(el=>el==socketID);
      // var possible=common.possibleMoves(r.game.hands[player][move.from],r.game.board);
      // if (!possible){
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
      //TO DO:CHECK IF NEXT PLAYER IS COMPUTER. IF IT IS, PLAY
      Core.AIPlay(move.roomID);
      return;
    }
    else
    {
      console.log("ERROR02:POSSIBLE MOVES-" + move.roomID);
    }
  },
  MoveCard:function(move,socketID)
  {
    var r=ROOMS.list.find(el=>el.id==move.roomID);
    if (r){
      var player=r.users.findIndex(el=>el==socketID);
      var possible=common.possibleMoves(r.game.hands[player][move.from],r.game.board);
      if (possible){
        if (possible.row==move.to){
          common.playFromTo(move.from,move.to, r.game.hands[player],r.game.board);
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

          Core.AIPlay(move.roomID);
          return;
        }
      }

    }
    else
    {
      console.log("ERROR01:ROOM NOT FOUND-" + move.roomID);
    }
  },
  AIPlay:function(roomID){
    console.log("ENTERING AIPlay");
    var r=ROOMS.list.find(el=>el.id==roomID);
    if (r){
      // console.log("FOUND ROOM:" + roomID);
      // console.log("r.game.currentPlayer");
      // console.log(r.game.currentPlayer);
      // console.log("r.game.win")
      // console.log(r.game.win)
      if (r.game.win*1==-1){
        if (r.users[r.game.currentPlayer].startsWith('AI-')){
        //AI PLAYER
        console.log("AI Player");
        var possibleMovesList=[];
        var impossibleMovesList=[];
        for (let index = 0; index < r.game.hands[r.game.currentPlayer].length; index++) {
          const card = r.game.hands[r.game.currentPlayer][index];
          var possible=common.possibleMoves(card,r.game.board);
          console.log(card);
          console.log(possible);
          if (possible)
          {
            if (possible.position<5)
            {
                possibleMovesList.push({ from:index, to:possible.row, roomID:roomID})
            }
          }
          else
          {
            impossibleMovesList.push(index);
          }
        }
  
        console.log("HAND");
        console.log(r.game.hands[r.game.currentPlayer]);
        if(possibleMovesList.length>0)
        {
          //PLAY POSSIBLE
          var p=Math.floor(Math.random()*possibleMovesList.length);
          console.log("PLAY POSSIBLE:" + p);
          console.log(possibleMovesList[p]);
          Core.MoveCard(possibleMovesList[p],r.users[r.game.currentPlayer])
        }
        else
        {
          //PLAY COLLECT
          var p=Math.floor(Math.random()*impossibleMovesList.length);
          console.log("PLAY IMPOSSIBLE:" + p);
          console.log(impossibleMovesList[p]);
          var rowImp=Math.floor(Math.random()*5);
          Core.MoveCardToCollect({ from:impossibleMovesList[p], to:rowImp, roomID:roomID}, r.users[r.game.currentPlayer])
        }
        }
      }
    }
  },
  start:function(io,roomID){
    var R=ROOMS.getRoom(roomID);

    var G=new game();
    G.init(R.users.length);

    R.game=G;

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