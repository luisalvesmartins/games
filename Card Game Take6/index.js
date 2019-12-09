var restify=require('restify');

// Create HTTP server
let server = restify.createServer();

var io = require('socket.io')(server.server);

var games=[];
var clients=0;
//games.push({id:1,players:[],state:"free"})

var userList=[];

function NewPass(){
    var p="";
    for(var f=0;f<8;f++)
    {
        p+=String.fromCharCode(65+Math.floor(Math.random()*25));
    }
    p+=String.fromCharCode("0".charCodeAt(0)+Math.floor(Math.random()*9));
    return p;
}
function idSegment(id){
    var p=id.indexOf("#");
    return id.substr(p+1);
}

var userAuth = io.of('/user');
userAuth.on('connection', function(socket) {
    socket.on('newUser', function(data) {
        var i=0;
        do {
            i++;
        } while (userList.find(u=>u.name=="Moo" + i));
        var U={name:"Moo" + i,pass:NewPass(),image:Math.floor(Math.random()*9),id:idSegment(socket.id)};
        userList.push(U);
        socket.emit("authenticated",U);
        addToGame(U.name,U.image,U.id);
    });
    socket.on('returningUser', function(data) {
        var name = data.name;
        var pass = data.pass;
        var image=data.image;
        var U=userList.find(u=>u.name==name && u.pass==pass);
        if (U){
            U.id=idSegment(socket.id);
            socket.emit("authenticated",U);
            addToGame(U.name,U.image,U.id);
        }
        else{
            socket.emit("authenticated",null);
            addToGame(name,image,idSegment(socket.id));
        }

    });
});

function addToGame(name,image,id){
    var g=games.find(el=>el.players.find(p=>p.name==name)!=null);
    if (g!=null){
        var p=g.players.find(p=>p.name==name);
        p.id=id;
        return g;
    }
    else
    {
        var g=games.find(el=>el.state=='free');
        if (g==null){
            games.push({players:[{playerType:'human', name:name,image:image,id:id}],state:"free"})
        }
        else
            g.players.push({playerType:'human', name:name,image:image,id:id});
        return g;
    }
}

const AINames=["Daisy", "Buttercup", "Milkshake", "Winnie the Moo", "Bessie", "Rosie", "MooDonna","Mooana","Moolawn"];

var gameSelection = io.of('/gameSelection');
gameSelection.on('connection', function(socket) {
    clients++;
    console.log('A user connected. Clients:' + clients);
    gameSelection.emit("numberOfPlayers",clients);

    socket.on('getMyGame',function(name){
        var g=games.find(el=>el.players.find(p=>p.name==name)!=null);
        gameSelection.emit("gameList",g);
    });
    // var g=games.find(el=>el.state=='free');
    // g.players.push({playerType:'human', id:socket.id})
    //socket.emit("gameList",g);

    socket.on('vote',function(data){
        console.log("SOCKET.ID")
        console.log(socket.id)
        var userId=idSegment(socket.id);
        console.log("AQUI:" + userId)
        console.log("g:" + JSON.stringify(games))
        var g=games.find(el=>el.state=='free' && el.players.find(p=>p.id==userId));
        if (g!=null){
            //COUNT HUMAN PLAYERS
            var humans=0;
            g.players.forEach(p=>{
                if (p.playerType=="human")
                    humans++;
            })
            switch (data) {
                case "addAI":
                    if (g.addAI!=null)
                    {
                        if (!g.addAI.find(v=>v.id==userId))
                            g.addAI.push({id:userId});
                    }
                    else
                        g.addAI=[{id:userId}];
                    if (g.addAI.length>=humans){
                        g.addAI=[];
                        //ADD AI
                        do{
                            var AIPlayer=Math.floor(AINames.length*Math.random());
                        } while(g.players.find(p=>p.name==AINames[AIPlayer])!=null)
                        g.players.push({playerType:"ai",name:AINames[AIPlayer],image:AIPlayer+1});
                        gameSelection.emit("gameList",g);
                        if (g.players.length>=10)
                        {
                            g.start=[];
                            g.state="START"
                            g.addAI=[];
                            gameSelection.emit("gameList",g);
                        }
                    }
                    break;
            
                case "start":
                    if (g.start!=null){
                        if (!g.start.find(v=>v.id==userId))
                            g.start.push({id:userId});
                    }
                    else
                        g.start=[{id:userId}];
                    if (g.start.length>=humans){
                        g.start=[];
                        g.state="START"
                        gameSelection.emit("gameList",g);
                    }
                    
                    break;
                default:
                    break;
            }
            gameSelection.emit("gameList",g);
        }
        else
            console.log("error")
    });
 

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        clients--;
       console.log('A user disconnected. Clients:' + clients);
    });
 });


//SERVE THE SITE
server.get('/site/*', // don't forget the `/*`
     restify.plugins.serveStaticFiles('./site')
);

//START SERVER
server.listen(process.env.port || process.env.PORT || 8080, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});