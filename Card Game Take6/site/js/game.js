const CardHeight=80;
const CardWidth=80;
const CardFontSize=44;

var Graphics={
    ctx:null,
    pat:null,
    patSel:null,
    width:0,
    height:0,
    init:function(canvasName){
        this.canvasName=canvasName;
        var c=document.getElementById(canvasName);
        this.ctx=c.getContext("2d");
        this.width=c.clientWidth;
        this.height=c.clientHeight;
        this.pat=this.ctx.createPattern(document.all("imgPattern"),"repeat");
        this.patSel=this.ctx.createPattern(document.all("imgSelPattern"),"repeat");
    },
    clear:function(){
        this.ctx.clearRect(0,0,this.width,this.height);
    },
    leftOrigin(){
        return (Graphics.width-6*CardWidth)/2;
    },
    drawHand:function(cards){
        for(let i=0;i<cards.length;i++)
        {
            this.drawCard(cards[i],cards[i].x,cards[i].y);
        }
    },
    drawSpaces:function(){
        for(let i=0;i<game.spaces.length;i++){
            const elem=game.spaces[i];
            if (elem.visible)
                this.drawSpace(elem.color,elem.x,elem.y);
        }
    },
    drawSpace:function(color,x,y){
        this.ctx.beginPath()
        if (color=="green")
            var pat=this.patSel;
        else
            var pat=color;
        this.ctx.fillStyle=pat;
        this.ctx.shadowBlur=0;
        this.ctx.shadowOffsetX=0;
        this.ctx.shadowOffsetY=0;
        this.ctx.fillRect(x,y,CardWidth,CardHeight);
        this.ctx.lineWidth=1;
        this.ctx.strokeStyle=color;
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
    drawCard:function(card,x,y){
        var cardNumber=card.number;
        var cattle=card.cattle;
        this.ctx.beginPath()
        this.ctx.strokeStyle="black"
        this.ctx.fillStyle="white";
        this.ctx.shadowBlur=2;
        this.ctx.shadowOffsetX=2;
        this.ctx.shadowOffsetY=2;
        this.ctx.shadowColor="gray";
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
            for(let j=0;j<4;j++){
                Graphics.drawEmpty(x+(i+2)*(CardWidth+5),j*(CardHeight+10));
            }
    
        }
        for (let i = 0; i < game.hands[0].length; i++) {
            if (move(game.hands[0][i],step))
                moved=true;
        }    
        for(let i=0;i<game.board.length;i++)
        {
            for(let j=0;j<game.board[i].length;j++){
                if (move(game.board[i][j],step))
                    moved=true;
            }
        }
        for(let i=0;i<game.nPlayers;i++)
            Graphics.drawHand(game.hands[i])
        for(let i=0;i<game.board.length;i++)
        {
            for(let j=0;j<game.board[i].length;j++){
                Graphics.drawCard(game.board[i][j],game.board[i][j].x,game.board[i][j].y)
            }
        }
        Graphics.drawSpaces();
    
        step++;
        if (step>100 || moved==false){
            step=100;
            //end of REDRAW
            if (game.queue.length>0)
            {
                var action=game.queue.splice(0,1);
                console.log(action)
                executeFunctionByName(action[0],window);
            }
        }
        else
            window.setTimeout(Graphics.drawBoard,16.67);
    
    },
    redrawBoard:function(){
        step=3;
        Graphics.drawBoard();
    },
    drawCurrentPlayer:function(){
        for(let i=0;i<game.nPlayers;i++)
            document.all("divPlayer" + (i+1)).style.backgroundColor="white";
        document.all("divPlayer" + (game.currentPlayer+1)).style.backgroundColor="lightgreen";
    },
    drawScoreboard:function(){
        var s="";
        for(let i=1;i<game.nPlayers+1;i++){
            s+="<div id=divPlayer" + i + "><div><img src='player" + i + ".png'></div><span>" + game.scores[i-1] + "</span></div>"
        }
        document.all("divScoreTable").innerHTML=s;
    }
}
function executeFunctionByName(functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
  }
var game={
    currentPlayer:0,
    nPlayers:0,
    queue:[],
    scores:[],
    deck:[],
    hands:[],
    board:[],
    spaces:[],
    init:function(nPlayers){
        //76 cards with 1 cattle head — the rest of the cards from 1 through 104
        for(let i=1;i<=104;i++)
        {
            this.deck.push({number:i, cattle:1});
        }
        //8 cards with 5 cattle heads — multiples of 11 (except 55): 11, 22, 33, 44, 66, 77, 88, 99
        for(let i=11;i<100;i=i+11)
        {
            this.deck[i-1]={number:i, cattle:5};
        }
        //10 cards with 3 cattle heads — multiples of ten: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
        for(let i=10;i<101;i=i+10)
        {
            this.deck[i-1]={number:i, cattle:3};
        }
        //9 cards with 2 cattle heads — multiples of five that are not multiples of ten (except 55): 5, 15, 25, 35, 45, 65, 75, 85, 95
        for(let i=5;i<101;i=i+10)
        {
            this.deck[i-1]={number:i, cattle:2};
        }
        //1 card with 7 cattle heads — number 55
        this.deck[54]={number:55, cattle:7};
        
        this.spaces.push({color:"red",visible:true,id:"C1",row:0,col:-1});
        this.spaces.push({color:"red",visible:true,id:"C2",row:1,col:-1});
        this.spaces.push({color:"red",visible:true,id:"C3",row:2,col:-1});
        this.spaces.push({color:"red",visible:true,id:"C4",row:3,col:-1});
        this.spaces.push({color:"green",visible:true,id:"P1",row:0,col:2});
        this.spaces.push({color:"green",visible:true,id:"P2",row:1,col:2});
        this.spaces.push({color:"green",visible:true,id:"P3",row:2,col:2});
        this.spaces.push({color:"green",visible:true,id:"P4",row:3,col:2});

        this.nPlayers=nPlayers;
        for(let i=0;i<nPlayers;i++){
            this.scores[i]=0;
            var hand=[];
            for(let j=0;j<10;j++){
                const n=Math.floor(this.deck.length*Math.random());
                const card=this.deck.splice(n,1);
                hand.push(card[0]);
            }
            hand=hand.sort(function(a,b){
                if (a.number<b.number) 
                    return -1;
                else 
                    return 1;
                });

            this.hands[i]=hand;
        }
        for(let j=0;j<4;j++){
            const n=Math.floor(this.deck.length*Math.random());
            const card=this.deck.splice(n,1);
            this.board[j]=card;
        }

    },
    playFromTo(player,cardNumber,row){
        const card=this.hands[player].splice(cardNumber,1)[0];
        this.board[row].push(card);
    },
    possibleMovesHand(handNumber){
        var moves=[];
        for (let index = 0; index < this.hands[handNumber].length; index++) {
            const element = this.hands[handNumber][index];
            moves.push(this.possibleMoves(element));
        }
        return moves;
    },
    possibleMoves(card){
        var possible=[];
        for(let j=0;j<4;j++){
            const topCard=this.board[j][this.board[j].length-1];
            if (card.number>topCard.number)
                possible.push({row:j,distance:card.number-topCard.number,position:this.board[j].length});
        }
        possible=possible.sort(function(a,b){if (a.distance<b.distance)return -1; else return 1;})
        if (possible.length>0)
        {
            possible=possible[0];
        }
        else
        {
            possible=null;
        }
        return possible;
    },
    nextPlayer(){
        this.currentPlayer++;
        if (this.currentPlayer>=this.nPlayers)
            this.currentPlayer=0;
        Graphics.drawCurrentPlayer();
        if (this.currentPlayer!=0){
            //MAGIC PLAY
            var possibleMoves=game.possibleMovesHand(this.currentPlayer);
            for(let i=0;i<possibleMoves.length;i++)
            {
                if (possibleMoves[i]==null)
                    possibleMoves[i]={i:i,row:null};
                else
                {
                    if (possibleMoves[i].position>=5){
                        possibleMoves[i].row2p=possibleMoves[i].row;
                        possibleMoves[i].position2p=possibleMoves[i].position;
                        possibleMoves[i].row=null;
                        possibleMoves[i].position=null;

                    }
                    possibleMoves[i].i=i;
                }
            }

            s="ALL MOVES FOR HAND " + this.currentPlayer +"<br>";
            //+ ":" + JSON.stringify(possibleMoves) + "<br>";
            for (let index = 0; index < game.hands[this.currentPlayer].length; index++) {
                const element = game.hands[this.currentPlayer][index];
                s+=JSON.stringify(element) + "->" + JSON.stringify(possibleMoves[index]) +  "<br>";
            }
            document.all("debug").innerHTML=s;

            //row,distance,position
            possibleMoves=possibleMoves.sort(function(a,b){
                if (a.distance>b.distance) 
                    return 1;
                else
                    return -1;})


            //play first
            if (possibleMoves.length>0)
            {
                if (possibleMoves[0].row==null){
                    //TEM QUE ESCOLHER QUAL O RED
                    var bestScore=999;
                    var bestRowToPlay=-1;
                    for(var row=0;row<4;row++){
                        var totalScore=0;
                        for(let i=0;i<game.board[row].length;i++)
                        {
                            totalScore+=game.board[row][i].cattle;
                        }
                        if (totalScore<bestScore){
                            bestScore=totalScore;
                            bestRowToPlay=row;
                        }
                    }
            
                    console.log("SCORES:")
                    console.log(bestRowToPlay)
                    var playThis=null;
                    for(let i=0;i<possibleMoves.length;i++)
                    {
                        if (possibleMoves[i].row2p==bestRowToPlay)
                        {
                            playThis=possibleMoves[i].i;
                            break;
                        }
                    }
                    if (playThis==null)
                    {
                        for(let i=0;i<possibleMoves.length;i++)
                        {
                            if (possibleMoves[i].row==null)
                            {
                                playThis=possibleMoves[i].i;
                                break;
                            }
                        }    
                    }

                    console.log(playThis)
                    console.log(game.hands[this.currentPlayer][playThis]);
                    userInteraction.lastCard=playThis;
                    userInteraction.moveToCollect(bestRowToPlay);


                }
                else
                {
                    var row=possibleMoves[0].row;
                    console.log("play:" + row)
                    console.log("card:" + possibleMoves[0].i)
                    console.log("CARD:" + game.hands[this.currentPlayer][possibleMoves[0].i])
                    //joga de i para row 
                    var col=game.board[row].length;
    
                    //PLAY TO
                    game.playFromTo(this.currentPlayer,possibleMoves[0].i,row);
                
                    var x=Graphics.leftOrigin();
                    game.board[row][col].toX=x+(CardWidth+5)*(col+1);
                    game.board[row][col].toY=(CardHeight+10)*row
                    game.spaces[row+4].x=x+(CardWidth+5)*(col+2);
                    game.spaces[row+4].visible=false;
                
                    //console.log(game.hands[0].length)
                    //userInteraction.adjustHand(0);
                    game.queue.push("game.nextPlayer");
                    Graphics.redrawBoard();
            

                }
            }
        }
    }
}

var step=3;
function move(obj,step){
    var moved=false;
    var dx=obj.toX-obj.x;
    if (Math.abs(dx)<1)
    {
        obj.x=obj.toX;
    }
    else
    {
        var dx= dx/2;//step;
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
        var dy= dy/2;//step;
        if (Math.abs(dy)<1) dy=1*Math.sign(dy);
        obj.y+=dy;
        moved=true;
    }
    return moved;
}

var userInteraction={
    lastCard:null,
    lastPossible:null,
    mouseUp(ev){
        const xy = document.all(Graphics.canvasName).getBoundingClientRect();
        var found=userInteraction.findClickedObject(ev.clientX-xy.left,ev.clientY-xy.top);

        console.log(found)
        if (found!=null)
        {
            //SELECT CARD
            if (found.card!=null)
            {
                if (found.card==userInteraction.lastCard)
                {
                    //click na mesma carta deve mandar para o único green
                    if (userInteraction.lastPossible!=null)
                    {
                        console.log("MOVE TO " + userInteraction.lastPossible)
                        userInteraction.moveTo(userInteraction.lastPossible);
                    }
                }
                else{
                    if (userInteraction.lastCard!=null)
                        game.hands[0][userInteraction.lastCard].toY=game.hands[0][userInteraction.lastCard].y+30;
                    userInteraction.lastCard=found.card;
                    //MOVE UP
                    game.hands[0][found.card].toY=game.hands[0][found.card].y-30;

                    //POSSIBLE MOVES
                    var possible=game.possibleMoves(game.hands[0][found.card]);
                    for(let i=0;i<8;i++){
                        game.spaces[i].visible=false;
                    }
                    console.log(possible)
                    if (possible){
                        if (possible.position>=5)
                        {
                            game.spaces[possible.row].visible=true;
                            userInteraction.lastPossible=null;
                        }
                        else
                        {
                            game.spaces[4+possible.row].visible=true;
                            userInteraction.lastPossible=possible.row;
                        }
                    }
                    else
                    {
                        for(let i=0;i<4;i++){
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
                    if (found.space>=4){
                        //NORMAL PLAY
                        game.spaces[found.space].visible=false;
                        var row=found.space-4;
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
    },
    findClickedObject:function(x,y){
        for (let i = 0; i < game.hands[0].length; i++) {
            const obj=game.hands[0][i];
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
    
        console.log("PLAYER:" +game.currentPlayer)
        //PLAY TO
        game.playFromTo(game.currentPlayer,userInteraction.lastCard,row);
    
        var x=Graphics.leftOrigin();
        game.board[row][col].toX=x+(CardWidth+5)*(col+1);
        game.spaces[row+4].x=x+(CardWidth+5)*(col+2);
        game.spaces[row+4].visible=false;
        console.log(game.board[row][col].toX)
        game.board[row][col].toY=(CardHeight+10)*row
        
        if (game.currentPlayer==0)
            userInteraction.adjustHand(0);
    
        userInteraction.lastCard=null;
        game.queue.push("game.nextPlayer");
        Graphics.redrawBoard();
    },
    moveToCollect:function(row){
        //get all cards and score them
        //replace zero with the new one

        for (let i=0;i<4;i++)
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
        Graphics.drawScoreboard();

        game.queue.push("userInteraction.moveToCollect2");
        userInteraction.row=row;
        Graphics.redrawBoard();
    },
    moveToCollect2:function(){
        var row=userInteraction.row;
        //get all cards and score them
        //replace zero with the new one
        game.board[row]=[];
        game.playFromTo(game.currentPlayer,userInteraction.lastCard,row);

        var x=Graphics.leftOrigin();
        game.board[row][0].toX=x+(CardWidth+5)*(1);
        game.board[row][0].toY=(CardHeight+10)*row

        game.spaces[row+4].x=x+(CardWidth+5)*(2);
        game.spaces[row+4].visible=false;
    
        if (game.currentPlayer==0)
            userInteraction.adjustHand(game.currentPlayer);
    
        userInteraction.lastCard=null;
        game.queue.push("game.nextPlayer");
        Graphics.redrawBoard();
    },
    adjustHand:function(nPlayer){
        var nCards=game.hands[nPlayer].length;
        var x=(Graphics.width-nCards/2*CardWidth)/2;
        for(let i=0;i<nCards;i++)
        {
            if (i<nCards/2){
                game.hands[nPlayer][i].toX=x+CardWidth*i;
                game.hands[0][i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*4;

            }
            else
            {
                game.hands[nPlayer][i].toX=x+CardWidth*(i-nCards/2);
                game.hands[0][i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*5;
            }
        }

    }
    
}

var Menu={
    play(nPlayers){
        document.all("divSelPlayers").style.display="none";

        document.all("myCanvas").style.display="block";
        Graphics.init("myCanvas");

        document.all("myCanvas").addEventListener("click", userInteraction.mouseUp);
        
        game.init(nPlayers);
    
        //PLAYER CARDS
        var x=(Graphics.width-game.hands[0].length/2*CardWidth)/2;
        for(let i=0;i<game.hands[0].length;i++)
        {
            game.hands[0][i].x=0;

            if (i<5){
                game.hands[0][i].toX=x+CardWidth*i;
                game.hands[0][i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*4;
                game.hands[0][i].y=30+3*Math.random()-3*Math.random()+(CardHeight+10)*4;    
            }
            else
            {
                game.hands[0][i].toX=x+CardWidth*(i-5);
                game.hands[0][i].toY=30+3*Math.random()-3*Math.random()+(CardHeight+10)*5;
                game.hands[0][i].y=30+3*Math.random()-3*Math.random()+(CardHeight+10)*5;    
            }
        }
        //OTHER PLAYERS
        for(let j=1;j<nPlayers;j++)
            for(let i=0;i<game.hands[j].length;i++)
            {
                game.hands[j][i].toX=-CardWidth;
                game.hands[j][i].toY=0;
                game.hands[j][i].x=-CardWidth;
                game.hands[j][i].y=0;
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
        for(let i=0;i<4;i++)
        {
            game.spaces[i].toX=x;
            game.spaces[i].toY=0;
            game.spaces[i].x=x;
            game.spaces[i].y=(CardHeight+10)*i;
            game.spaces[i].visible=false;
    
            game.spaces[4+i].toX=0;
            game.spaces[4+i].toY=0;
            game.spaces[4+i].x=x+(CardWidth+5)*(game.board[i].length+1);;
            game.spaces[4+i].y=(CardHeight+10)*i;
            game.spaces[4+i].visible=false;
        }
    
        Graphics.redrawBoard();
        Graphics.drawScoreboard();
        Graphics.drawCurrentPlayer();    
    },
    selectPlayers:function(){
        var sT="";
        var size=30;
        for(let i=2;i<=10;i++){
            var s="<div onclick='Menu.play(" + i + ")' style='cursor:pointer;'>";
            size=30+(10-i)*2.5;
            for(let j=1;j<=i;j++){
                s+="<img style='width:" + size + "px;height:" + size + "px;' src='player" + j + ".png'>";
            }
            s+="</div>"
            sT+=s;
        }
        document.all("divSelPlayers").innerHTML=sT;
    }    
}
