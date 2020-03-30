const NUMBER_OF_ROWS=5;
class game {
    init(nPlayers){
        this.deck=[];
        this.currentPlayer=0;
        this.nPlayers=0;
        this.scores=[];
        this.deck=[];
        this.hands=[];
        this.board=[];
        this.spaces=[];
        this.win=-1;

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
        this.spaces.push({color:"red",visible:true,id:"C5",row:4,col:-1});
        this.spaces.push({color:"green",visible:true,id:"P1",row:0,col:2});
        this.spaces.push({color:"green",visible:true,id:"P2",row:1,col:2});
        this.spaces.push({color:"green",visible:true,id:"P3",row:2,col:2});
        this.spaces.push({color:"green",visible:true,id:"P4",row:3,col:2});
        this.spaces.push({color:"green",visible:true,id:"P5",row:4,col:2});

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
        for(let j=0;j<5;j++){
            const n=Math.floor(this.deck.length*Math.random());
            const card=this.deck.splice(n,1);
            this.board[j]=card;
        }

    }
}
module.exports = game;