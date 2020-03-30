var Actions={
    mode:"",
    createID:function(){
        Actions.mode="CREATE";
        document.getElementById("divJoin").style.display="none";
        document.getElementById("divCreate").style.display="block";
        socket.emit('createGame', 'nothing');
        document.getElementById("divWaiting").style.display="block";
        
        Actions.adv(2);
    },
    joinID:function(){
        Actions.mode="JOIN";
        document.getElementById("divJoin").style.display="block";
        document.getElementById("divCreate").style.display="none";

        document.getElementById("divWaiting").style.display="none";
        document.getElementById("divWaitMessage").style.display="block";
        Actions.adv(2);
    },
    joinRandom:function(){
        Actions.mode="JOIN";
        console.log("RANDOM")
        document.getElementById("divIns").style.display="none";
        // document.getElementById("divCreate").style.display="none";
        document.getElementById("divWaiting").style.display="block";

        document.getElementById("btnStart").style.display="none";
        document.getElementById("divWaitMessage").style.display="block";
        socket.emit('getRandomGame',document.getElementById("txtName").value);
        Actions.adv(2);
    },
    startGame:function(){
        //if (Actions.mode=="JOIN")
        //    socket.emit('joinGame', document.getElementById("txtID").value);
        socket.emit('startGame',document.getElementById("txtID").value,document.getElementById("txtName").value);
        //Actions.adv(3);
    },
    sendChatMessage:function(){
        console.log("MESSAGE")
        console.log(document.getElementById("txtChat").value)
        socket.emit('chatMessage',document.getElementById("txtChat").value)
    },
    adv:function(id){
        document.getElementById("panel"+(id-1)).style.display="none";
        document.getElementById("panel"+id).style.display="flex";
    },
    txtID_keyUp:function(e){
        if (e.key=="Enter"){
            //IF JOIN
            console.log(Actions.mode)
            if (Actions.mode=="JOIN"){
                document.getElementById("divWaiting").style.display="block";
                document.getElementById("divIns").style.display="none";
                document.getElementById("btnStart").style.display="none";

                console.log("calling")

                socket.emit('joinGame', document.getElementById("txtID").value, document.getElementById("txtName").value);
            }
        }

    },
    txtName_keyUp:function(e){
        if (e.key=="Enter"){
            socket.emit('changeName', document.getElementById("txtName").value);
        }
    }
}


function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}


var Graphics={
    ctx:null,
    pat:null,
    patSel:null,
    width:0,
    height:0,
    animateCard:function(obj,step){
        var moved=false;
        var dx=obj.toX-obj.x;
        if (Math.abs(dx)<1)
        {
            obj.x=obj.toX;
        }
        else
        {
            var dx= dx/step;
            if (Math.abs(dx)<1) dx=1*Math.sign(dx);
            obj.x+=dx;
            moved=true;
        }

        var dy=obj.toY-obj.y;
        if (Math.abs(dy)<1)
        {
            obj.y=obj.toY;
        }
        else
        {
            var dy= dy/step;
            if (Math.abs(dy)<1) dy=1*Math.sign(dy);
            obj.y+=dy;
            moved=true;
        }
        return moved;
    },
    init:function(canvasName){
        var c=document.getElementById(canvasName);
        this.ctx=c.getContext("2d");
        this.width=c.clientWidth;
        this.height=c.clientHeight;
        this.width=700;
        this.height=720;
        this.pat=this.ctx.createPattern(document.all("imgPattern"),"repeat");
        this.patSel=this.ctx.createPattern(document.all("imgSelPattern"),"repeat");

        document.all("myCanvas").addEventListener("click", userInteraction.mouseUp);

        //PLAYER CARDS
        var x=(Graphics.width-game.hands.length/2*CardWidth)/2;
        for(let i=0;i<game.hands.length;i++)
        {
            game.hands[i].x=0;

            if (i<5){
                game.hands[i].toX=x+CardWidth*i;
                game.hands[i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*4 + HandsYPos;
                game.hands[i].y=30+3*Math.random()-3*Math.random()+(CardHeight+10)*4 + HandsYPos;
            }
            else
            {
                game.hands[i].toX=x+CardWidth*(i-5);
                game.hands[i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*5 + HandsYPos;
                game.hands[i].y=30+3*Math.random()-3*Math.random()+(CardHeight+10)*5 + HandsYPos;
            }
        }
        //BOARD
        var x=Graphics.leftOrigin();
        for(let i=0;i<game.board.length;i++)
        {
            for(let j=0;j<game.board[i].length;j++){
                game.board[i][j].toX=x+(CardWidth+5)*(j+1);
                game.board[i][j].toY=(CardHeight+10)*i
                game.board[i][j].x=x+(CardWidth+5)*(j+1);
                game.board[i][j].y=0;
            }
        }
        for(let i=0;i<NUMBER_OF_ROWS;i++)
        {
            game.spaces[i].toX=x;
            game.spaces[i].toY=0;
            game.spaces[i].x=x;
            game.spaces[i].y=(CardHeight+10)*i;
            game.spaces[i].visible=false;
    
            game.spaces[NUMBER_OF_ROWS+i].toX=0;
            game.spaces[NUMBER_OF_ROWS+i].toY=0;
            game.spaces[NUMBER_OF_ROWS+i].x=x+(CardWidth+5)*(game.board[i].length+1);;
            game.spaces[NUMBER_OF_ROWS+i].y=(CardHeight+10)*i;
            game.spaces[NUMBER_OF_ROWS+i].visible=false;
        }


    },
    clear:function(){
        this.ctx.clearRect(0,0,this.width,this.height);
    },
    leftOrigin(){
        return (Graphics.width-6*CardWidth)/2;
    },
    drawHand:function(cards,dim){
        for(let i=0;i<cards.length;i++)
        {
            this.drawCard(cards[i],cards[i].x,cards[i].y,dim);
        }
    },
    drawSpaces:function(spaces){
        for(let i=0;i<spaces.length;i++){
            const elem=spaces[i];
            if (elem.visible)
                this.drawSpace(elem.color,elem.x,elem.y);
        }
    },
    drawSpace:function(color,x,y){
        this.ctx.beginPath()
        if (color=="green"){
            var pat=this.patSel;
            this.ctx.fillStyle=pat;
            this.ctx.strokeStyle="black";
        }
        else
        {
            var pat=color;
            this.ctx.fillStyle=pat;
            this.ctx.strokeStyle=color;
        }
        this.ctx.shadowBlur=0;
        this.ctx.shadowOffsetX=0;
        this.ctx.shadowOffsetY=0;
        this.ctx.fillRect(x,y,CardWidth,CardHeight);
        this.ctx.lineWidth=1;
        this.ctx.strokeRect(x,y,CardWidth,CardHeight);
    },
    drawEmpty:function(x,y){
        this.ctx.beginPath();
        this.ctx.shadowBlur=0;
        this.ctx.shadowOffsetX=0;
        this.ctx.shadowOffsetY=0;
        this.ctx.fillStyle=this.pat;
        this.ctx.fillRect(x,y,CardWidth,CardHeight);
        this.ctx.lineWidth=1;
        this.ctx.strokeStyle="black";
        this.ctx.strokeRect(x,y,CardWidth,CardHeight);
    },
    drawCard:function(card,x,y,dim){
        var cardNumber=card.number;
        var cattle=card.cattle;
        this.ctx.beginPath()
        this.ctx.strokeStyle="black"
        if (dim)
            this.ctx.fillStyle="#C5C5C5";
        else
            this.ctx.fillStyle="#f7e7e7";
        this.ctx.shadowBlur=2;
        this.ctx.shadowOffsetX=2;
        this.ctx.shadowOffsetY=2;
        this.ctx.shadowColor="rgb(114, 29, 29)";
        this.ctx.fillRect(x,y,CardWidth,CardHeight);

        this.ctx.shadowBlur=0;
        this.ctx.shadowOffsetX=0;
        this.ctx.shadowOffsetY=0;
        this.ctx.strokeRect(x,y,CardWidth,CardHeight);

        this.ctx.drawImage(imgBack,x,y,CardWidth,CardHeight);

        //TEXT
        var fontName="Helvetica"

        this.ctx.textAlign = "center"; 
        this.ctx.textBaseline = "middle";
        this.ctx.fillStyle="orange"
        this.ctx.font="bold " + CardFontSize + "px " + fontName;
        this.ctx.fillText(cardNumber,x+CardWidth/2,y+CardHeight/2+10);
        this.ctx.lineWidth=3;
        this.ctx.strokeStyle="black"
        this.ctx.strokeText(cardNumber,x+CardWidth/2,y+CardHeight/2+10);

        this.ctx.lineWidth=1;
        //CATTLE 1,2,3,5,7
        var rows=1;
        var top=cattle;
        switch(cattle)
        {
            case 5:
                rows=2;
                top=3;
                break;
            case 7:
                top=4;
                rows=2;
                break;
        }
        var w=15;
        var x1=x+(CardWidth-top*17)/2;
        var y1=y+1;
        for(let i=0;i<top;i++)
        {
            //this.ctx.strokeRect(x1,y1,15,15);
            this.ctx.drawImage(imgMini,x1,y1,15,15);
            x1=x1+w+2;
        }
        if (rows==2){
            var y1=y1+10;
            var x1=x+(CardWidth-(cattle-top)*17)/2;
            for(let i=0;i<cattle-top;i++)
            {
                this.ctx.drawImage(imgMini,x1,y1,15,15);
                x1=x1+w+2;
            }
        }
    },
    drawBoard:function(){
        Graphics.clear();
        var moved=false;
        var x=Graphics.leftOrigin();
        for(let i=0;i<4;i++){
            for(let j=0;j<NUMBER_OF_ROWS;j++){
                Graphics.drawEmpty(x+(i+2)*(CardWidth+5),j*(CardHeight+10));
            }
    
        }
        for (let i = 0; i < game.hands.length; i++) {
            if (Graphics.animateCard(game.hands[i],step))
                moved=true;
        }    
        for(let i=0;i<game.board.length;i++)
        {
            for(let j=0;j<game.board[i].length;j++){
                if (Graphics.animateCard(game.board[i][j],step))
                    moved=true;
            }
        }
        var dim=true;
        if (game.currentPlayer==game.player)
            dim=false;
            //for(let i=0;i<game.nPlayers;i++)
        Graphics.drawHand(game.hands,dim)
        for(let i=0;i<game.board.length;i++)
        {
            for(let j=0;j<game.board[i].length;j++){
                Graphics.drawCard(game.board[i][j],game.board[i][j].x,game.board[i][j].y)
            }
        }
        Graphics.drawSpaces(game.spaces);
    
        step++;
        if (step>100 || moved==false){
            step=100;
            //end of REDRAW
        }
        else
            window.setTimeout(Graphics.drawBoard,16.67);
    
    },
    redrawBoard:function(){
        step=2;
        userInteraction.adjustHand(0);
        Graphics.drawBoard();
        Graphics.drawScoreboard();
    },
    drawCurrentPlayer:function(){
        for(let i=0;i<game.nPlayers;i++)
            document.all("divPlayer" + (i+1)).style.backgroundColor="white";
        document.all("divPlayer" + (game.currentPlayer+1)).style.backgroundColor="lightgreen";
    },
    drawScoreboard:function(){
        var s="";
        var sW="";
        var m=100;
        for(let i=0;i<game.nPlayers;i++){
            m=Math.min(m,game.scores[i]);
        }
        for(let i=1;i<game.nPlayers+1;i++){
            var b="";
            if (game.scores[i-1]==m)
            {
                b=" style='background-color:lightgreen'";
                sW+="<img src='assets/player" + i + ".png'>";
            }
            var bo="";
            if (i==game.player+1)
                bo=" style='border:2px solid brown;'"
            s+="<div id=divPlayer" + i + b + ">" + 
                "<div><img src='assets/player" + i + ".png'" + bo + "></div><span>" + game.scores[i-1] + "</span>" + 
                "</div>"
        }
        document.all("divScoreTable").innerHTML=s;
        document.all("divWinners").innerHTML=sW;
    }
}


var userInteraction={
    lastCard:null,
    lastPossible:null,
    getScrollXY:function() {
        var scrOfX = 0, scrOfY = 0;
        if( typeof( window.pageYOffset ) == 'number' ) {
        //Netscape compliant
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
        } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
        //DOM compliant
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
        } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
        //IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
        }
        return [ scrOfX, scrOfY ];
    },
    mouseUp(ev){
        if (game.currentPlayer==game.player){
            var xy=userInteraction.getScrollXY();
            var cr=document.all("myCanvas").getBoundingClientRect();
            var found=userInteraction.findClickedObject(ev.clientX+xy[0]-cr.left,ev.clientY+xy[1]-cr.top);
            if (found!=null)
            {
                //SELECT CARD
                if (found.card!=null)
                {
                    if (found.card==userInteraction.lastCard)
                    {
                        console.log("userInteraction.lastPossible")
                        console.log(userInteraction.lastPossible)
                        //click na mesma carta deve mandar para o único green
                        if (userInteraction.lastPossible!=null)
                        {
                            //console.log("MOVE TO " + userInteraction.lastPossible)
                            userInteraction.moveTo(userInteraction.lastPossible);
                        }
                    }
                    else{
                        if (userInteraction.lastCard!=null)
                            game.hands[userInteraction.lastCard].toY=game.hands[userInteraction.lastCard].y+30;
                        userInteraction.lastCard=found.card;
                        //MOVE UP
                        game.hands[found.card].toY=game.hands[found.card].y-30;

                        //POSSIBLE MOVES
                        var possible=common.possibleMoves(game.hands[found.card],game.board);
                        //HIDE ALL SPACES
                        for(let i=0;i<game.spaces.length;i++){
                            game.spaces[i].visible=false;
                        }
                        console.log("possible")
                        console.log(possible)
                        if (possible){
                            if (possible.position>=5)
                            {
                                game.spaces[possible.row].visible=true;
                                userInteraction.lastPossible=null;
                            }
                            else
                            {
                                game.spaces[NUMBER_OF_ROWS+possible.row].visible=true;
                                userInteraction.lastPossible=possible.row;
                            }
                        }
                        else
                        {
                            for(let i=0;i<NUMBER_OF_ROWS;i++){
                                game.spaces[i].visible=true;
                            }
                            userInteraction.lastPossible=null;
                        }
                        Graphics.redrawBoard();
                    }
                }
                //SPACE
                if (found.space!=null){
                    if (userInteraction.lastCard!=null)
                    {
                        if (found.space>=5){
                            //NORMAL PLAY
                            game.spaces[found.space].visible=false;
                            var row=found.space-NUMBER_OF_ROWS;
                            userInteraction.moveTo(row);
                        }
                        else
                        {
                            //PLAY & COLLECT
                            var row=found.space;
                            userInteraction.moveToCollect(row);
                        }
                    }
                }
            }
        }
    },
    findClickedObject:function(x,y){
        for (let i = 0; i < game.hands.length; i++) {
            const obj=game.hands[i];
            if (obj.x<=x && obj.x+CardWidth>=x && obj.y<=y && obj.y+CardHeight>=y)
                return {card:i};
        }
        for (let i = 0; i < game.spaces.length; i++) {
            const obj=game.spaces[i];
            if (obj.x<=x && obj.x+CardWidth>=x && obj.y<=y && obj.y+CardHeight>=y)
                return {space:i};
        }
        return null;
    },
    moveTo:function(row){
        var col=game.board[row].length;
        var mobe={from:userInteraction.lastCard, to: row, roomID:document.getElementById("txtID").value};
    
        //PLAY TO
        common.playFromTo(userInteraction.lastCard,row, game.hands,game.board)
    
        var x=Graphics.leftOrigin();
        game.board[row][col].toX=x+(CardWidth+5)*(col+1);
        game.spaces[row+NUMBER_OF_ROWS].x=x+(CardWidth+5)*(col+2);
        game.spaces[row+NUMBER_OF_ROWS].visible=false;
        game.board[row][col].toY=(CardHeight+10)*row
        
        if (game.currentPlayer==0)
            userInteraction.adjustHand(0);
    
        userInteraction.lastCard=null;
        socket.emit("playerMoved",mobe)
        Graphics.redrawBoard();
    },
    moveToCollect:function(row){
        //get all cards and score them
        //replace zero with the new one
        console.log("ROW:" + row)

        for (let i=0;i<NUMBER_OF_ROWS;i++)
            game.spaces[i].visible=false;

        var totalScore=0;
        for(let i=0;i<game.board[row].length;i++)
        {
            var elem=game.board[row][i];
            elem.toX=-CardWidth*2;
            elem.toY=0;
            totalScore+=elem.cattle;
        }
        game.scores[game.currentPlayer]+=totalScore;
        //Graphics.drawScoreboard();

        var mobe={from:userInteraction.lastCard, to: row, roomID:document.getElementById("txtID").value};

        //userInteraction.row=row;
        //Graphics.redrawBoard();
    //     userInteraction.moveToCollect2();
    // },
    // moveToCollect2:function(){
        //var row=userInteraction.row;
        //get all cards and score them
        //replace zero with the new one
        game.board[row]=[];
        //game.playFromTo(game.currentPlayer,userInteraction.lastCard,row);
        common.playFromTo(userInteraction.lastCard,row, game.hands,game.board)

        var x=Graphics.leftOrigin();
        game.board[row][0].toX=x+(CardWidth+5)*(1);
        game.board[row][0].toY=(CardHeight+10)*row

        game.spaces[row+NUMBER_OF_ROWS].x=x+(CardWidth+5)*(2);
        game.spaces[row+NUMBER_OF_ROWS].visible=false;
    
        if (game.currentPlayer==0)
            userInteraction.adjustHand(game.currentPlayer);
    
        userInteraction.lastCard=null;
        Graphics.redrawBoard();
        socket.emit("playerMovedToCollect",mobe)
    },
    adjustHand:function(nPlayer){
        var nCards=game.hands.length;
        var x=(Graphics.width-nCards/2*CardWidth)/2;
        for(let i=0;i<nCards;i++)
        {
            if (i<nCards/2){
                game.hands[i].toX=x+CardWidth*i;
                game.hands[i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*4+HandsYPos;

            }
            else
            {
                game.hands[i].toX=x+CardWidth*(i-nCards/2);
                game.hands[i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*5+HandsYPos;
            }
        }

    }
}
