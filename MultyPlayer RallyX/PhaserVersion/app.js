// reads in our .env file and makes those values available as environment variables
//require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
//const mongoose = require('mongoose');
//const cookieParser = require('cookie-parser');
//const passport = require('passport');

//const routes = require('./routes/main');
//const secureRoutes = require('./routes/secure');
//const passwordRoutes = require('./routes/password');
//const asyncMiddleware = require('./middleware/asyncMiddleware');

// setup mongo connection
// const uri = process.env.MONGO_CONNECTION_URL;
// mongoose.connect(uri, { useNewUrlParser : true, useCreateIndex: true });
// mongoose.connection.on('error', (error) => {
//   console.log(error);
//   process.exit(1);
// });
// mongoose.connection.on('connected', function () {
//   console.log('connected to mongo');
// });
// mongoose.set('useFindAndModify', false);

// create an instance of an express app
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

var players ={};
var flags=[
  {x: 9, y: 5, id: 0},
  {x: 24, y: 8, id: 1},
  {x: 32, y: 9, id: 2},
  {x: 17, y: 17, id: 3},
  {x: 21, y: 19, id: 4},
  {x: 35, y: 35, id: 5},
  {x: 9,  y: 46, id: 6},
  {x: 14, y: 51, id: 7},
  {x: 13, y: 53, id: 8},
  {x: 22, y: 60, id: 9}
];

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id);
  // create a new player and add it to our players object
  players[socket.id] = {
    x:492,y:1284,
    // x: Math.floor(Math.random() * 400) + 50,
    // y: Math.floor(Math.random() * 500) + 50,
    direction:1,
    playerId: socket.id
  };
  // send the players object to the new player
  socket.emit('currentPlayers', players, flags);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id);
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
    console.log(players)
    console.log(JSON.stringify(players))
    for(var element in players)
    {
        if (Date.now()-element.dateStamp>10000 || element.dateStamp==undefined){
          console.log("FORCE:")
          console.log(element)
            io.emit('disconnect', element.playerId);
            delete element;
        }
    };
  });

  socket.on('collectFlag', function (flag) {
    console.log(flag)
    for (let index = 0; index < flags.length; index++) {
      const element = flags[index];
      if (flags[index].id==flag.id){
        flags[index].x=flag.x;
        flags[index].y=flag.y;
      }
    }
    socket.broadcast.emit('collectFlag', flag);
    });
  
  // when a plaayer moves, update the player data
  socket.on('playerMovement', function (movementData) {
      if(!players[movementData.playerId])
        players[movementData.playerId]= {playerId:movementData.playerId};
    players[movementData.playerId].x = movementData.x;
    players[movementData.playerId].y = movementData.y;
    players[movementData.playerId].direction= movementData.direction;
    players[movementData.playerId].velocityX= movementData.velocityX;
    players[movementData.playerId].velocityY= movementData.velocityY;
    players[movementData.playerId].dateStamp=Date.now();
    //movementData.playerId=socket.id;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', movementData); //players[socket.id]);
  });
});

// update express settings
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
//app.use(cookieParser());

// require passport auth
//require('./auth/auth');

// app.get('/game.html', passport.authenticate('jwt', { session : false }), function (req, res) {
//   res.sendFile(__dirname + '/public/game.html');
// });

app.get('/game.html', function (req, res) {
  res.sendFile(__dirname + '/public/game.html');
});

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// main routes
//app.use('/', routes);
//app.use('/', passwordRoutes);
//app.use('/', passport.authenticate('jwt', { session : false }), secureRoutes);

// catch all other routes
app.use((req, res, next) => {
  res.status(404).json({ message: '404 - Not Found' });
});

// handle errors
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(err.status || 500).json({ error: err.message });
});

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`);
});
