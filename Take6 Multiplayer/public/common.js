(function(exports){

    const NUMBER_OF_ROWS=5;

    exports.possibleMoves=function(card,board){
        var possible=[];
        for(let j=0;j<NUMBER_OF_ROWS;j++){
            const topCard=board[j][board[j].length-1];
            if (card.number>topCard.number)
                possible.push({row:j,distance:card.number-topCard.number,position:board[j].length});
        }
        possible=possible.sort(function(a,b){if (a.distance<b.distance) return -1; else return 1;})
        if (possible.length>0)
        {
            possible=possible[0];
        }
        else
        {
            possible=null;
        }
        return possible;
    }

    exports.possibleMovesHand=function(handNumber,hands,board){
        var moves=[];
        for (let index = 0; index < hands[handNumber].length; index++) {
            moves.push(this.possibleMoves( hands[handNumber][index],board ));
        }
        return moves;
    }

    exports.playFromTo=function(cardNumber,row,hands,board){
        const card=hands.splice(cardNumber,1)[0];
        board[row].push(card);
    }

    exports.nextPlayer=function(currentPlayer,nPlayers, hands,scores){
        console.log("HANDS")
        console.log(hands)
        console.log(hands[currentPlayer].length)
        var cpCards=hands[currentPlayer].length;

        currentPlayer++;
        if (currentPlayer>=nPlayers)
            currentPlayer=0;
            console.log("currentPlayer")
            console.log(currentPlayer)
        // var possibleMoves=this.possibleMovesHand(currentPlayer,hands,board);
        var endGame=true;
        for(let i=0;i<nPlayers;i++){
            if (hands[i].length!=0)
            {
                endGame=false;
                break;
            }
        }

        // if (possibleMoves.length==0)
        if (endGame)
        {
            //CHECK WINNER
            var min=scores[0];
            for(let i=1;i<nPlayers;i++){
                min=Math.min(min,scores[i]);
            }
            return {currentPlayer:-1, winScore:min};
        }
        else
        {
            return {currentPlayer:currentPlayer, winScore:-1};
        }
    }


})(typeof exports === 'undefined'? this['common']={}: exports);