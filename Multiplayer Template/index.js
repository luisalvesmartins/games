require('dotenv').config();
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const PLAYERS_NEEDED=2;

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
    ROOMS.list.push({id:roomId,users:[socketId]});
    console.log(ROOMS.list)
  },
  addUser:function(roomId,socketId){
    var r=ROOMS.list.find(el=>el.id==roomId);
    if (r){
      r.users.push(socketId);
      console.log(ROOMS.list)
      return r;
    }
    else
    {
      return false;
    }
  }
}

var IO={
  init: function(io,socket) {
    console.log('a user connected:' + socket.id);
    //gameSocket = socket;

    socket.on('disconnect', IO.disconnected);
    socket.on('createGame', IO.createGame);
    socket.on('joinGame', IO.joinGame);
    socket.on('changeName', IO.changeName);
    socket.on('chatMessage', IO.chatMessage);
  
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
  },
  joinGame:function(roomID){
    console.log("joined:" + roomID);
    var room=ROOMS.addUser(roomID,this.id);
    if (room){
      this.join("R-" + roomID);
      io.to("R-" + roomID).emit('chatMessage', message("user " + this.id + " joined",2));

      //CHECK IF #USERS IN THE ROOM IS ENOUGH TO START GAME
      if (room.users.length==PLAYERS_NEEDED)
      {
        //GAME START
        io.to("R-" + roomID).emit('gameStart');
      }
    }
    else
    {
      this.emit('chatMessage', message("room " + roomID + " does not exist",1));
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
        }
        
      }
    }
  }
}

function message(m,msgType){
  return {t:m,e:msgType||0};
}