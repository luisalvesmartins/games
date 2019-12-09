const PATH_Images="./";

var UserInfo={
    userId:null,
    name:"",
    pass:null,
    loaded:false,
    image:1,
    load:function(){
        if (typeof(Storage) !== "undefined") {
            var mem=localStorage.getItem("userInfo");
            if (mem!=null){
                console.log("MEM:" + mem)
                var newUserInfo=JSON.parse(mem);
                UserInfo.name=newUserInfo.name;
                UserInfo.pass=newUserInfo.pass;
                UserInfo.image=newUserInfo.image;
                UserInfo.loaded=true;
            }
        } else {
            alert("No storage support, no play...");
        }
    },
    save:function(){
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("userInfo", JSON.stringify(UserInfo));
        } else {
            alert("No storage support, no play...");
        }
    },
    init:function(){
        UserInfo.load();
        if(UserInfo.loaded){
            return true;
        }
        else
        {
            return false;
        }
    },
    login:function(){
        if (!UserInfo.init())
            socketUser.emit('newUser');
        else
        {
            //alert("RETURN USER:" + JSON.stringify(UserInfo));
            socketUser.emit('returningUser',{name:UserInfo.name, pass:UserInfo.pass,image:UserInfo.image});
        }
    }
}

var socketUser = io('/user');
socketUser.on('connect',function(){
});
socketUser.on('authenticated',function(data){
    if (data==null)
    {
        //console.log("NewUser")
        socketUser.emit('newUser');
    }
    else
    {
        UserInfo.name=data.name;
        UserInfo.pass=data.pass;
        UserInfo.image=data.image;
        //console.log("AUTHENTICATED:" + JSON.stringify(UserInfo));
        UserInfo.save();
    }
});

UserInfo.login();

        var socket = io('/gameSelection');
        socket.emit("getMyGame",UserInfo.name);

        socket.on('connect',function(){
        });
        
        socket.on('gameList', function(data){
            var s="";
            data.players.forEach(player => {
                //player.name player.image player.playerType
                if (player.playerType=="human")
                    var cl="human";
                else
                    var cl="ai";
                s+="<div style='border:1px solid;width:90px;height:90px;text-align:center;margin-right:10px;'><img src='" + PATH_Images + "player" + player.image + ".png' style='width:45px;height:45px'><br>" + player.name + "</div>";
            });
            document.all("divGameInfo").innerHTML=s;
            if (data.addAI!=null)
                var l=" (" + data.addAI.length + ")";
            else
                var l="";
            if (l==" (0)")
                l="";
            document.all("btnVoteAdd").innerText="Add AI" + l;
            if (data.start!=null)
                l=" (" + data.start.length + ")";
            else
                l="";
            if (l==" (0)")
                l="";
            document.all("btnVoteStart").innerText="Start" + l;
            if (data.state=="START"){
                document.all("divStep1").style.display="none";
                document.all("divStep2").style.display="block";
                //start it
                //display board
            }
        });
        socket.on('numberOfPlayers', function(data){
            document.all("messages").innerHTML+=data + " players connected<br>";
        });

var Vote={
    addAI:function(){
        socket.emit("vote","addAI");
    },
    start:function(){
        socket.emit("vote","start");
    },
}

var GameType={
    go:function(t){
        document.all("divGameTypeSelection").style.display="none";
        if (t==0){
            //SOLITAIRE
            document.all("divGameAlone").style.display="block";
            Menu.selectPlayers();
        }
        else
        {
            //ONLINE
            document.all("divGamePlayerSelection").style.display="block";
        }
    }
}
