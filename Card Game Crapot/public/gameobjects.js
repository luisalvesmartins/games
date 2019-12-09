class Card {
	constructor(suit,rank){
		this.suit=suit;
		this.rank=rank;
	}

	isAlternateSuit(card){ //RETURN  true or false
		return (Math.abs(card.suit-this.suit)!=2 && card.suit!=this.suit);
	}
	isSomeSuit(card){ //RETURN true or false
		return (card.suit==this.suit);
	}
	isSequential(card){ //RETURN 1,-1 or 0 if not sequential
		var d=card.rank-this.rank;
		if (Math.abs(d)==1)
			return d;
		else
			return 0;
	}
	
	render(addClass,pile){
        var cardRankImage=["ace","2","3","4","5","6","7","8","9","10","jack","queen","king"];
        var cardSuitImage=["hearts","spades","diamonds","clubs"];

        var sAddClass="";
		if (addClass!=null)
			sAddClass=addClass + " ";
        if (this.rank==-2)
            return "<img pile='" + pile + "' class='card' " + sAddClass + "src='deck1/bg.png'/>";
        else
    		if (this.rank==-1)
			    return "<img pile='" + pile + "' class='card dropable' " + sAddClass + "src='deck1/placeholder.png'/>";
		    else{
    			var suit=cardSuitImage[this.suit];
			    return "<img pile='" + pile + "' class='card draggable dropable' " + sAddClass + "src='deck1/" + cardRankImage[this.rank] + "_of_" + suit +".png'/>";
		    }
	}

	debug(){
		return this.rank + "_" + this.suit;
	}
}

class Deck {
	constructor(numberOfDecks){
		this.cards=new Array(52*numberOfDecks);

		var positions=new Array(52*numberOfDecks);
		for(var i=0;i<52*numberOfDecks;i++)
		{
			positions[i]=i;
		}
		
		for(var k=0;k<numberOfDecks;k++){
			for(var i=0;i<4;i++){
				for(var j=0;j<13;j++){
					var r=Utils.getRandomInt(positions.length);
					if (r>=positions.length)
						r=positions.length-1;
					var pos=positions[r];
					positions.splice(r,1);
					this.cards[pos]=new Card(i,j);
				}
			}
		}
	}
	
	takeCards(numberOfCards){
		var cards=new Array(numberOfCards);
		for(var i=0;i<numberOfCards;i++)
		{
			cards[i]=this.cards.shift();
		}
		return cards;
	}
	
	debug() {
		var s="";
		for(var i=0;i<this.cards.length;i++)
		{
			s=s+this.cards[i].debug() + " ";
		}
		return s;
	}
}

class Pile {
	constructor(id,cards,show,accept){
		this.id=id;
		this.cards=cards;
		this.show=show;
		this.accept=accept;
	}
	
	canDrop(card){
		if (this.cards.length==0)
		{
			if (this.accept.whenEmpty)
			{
				if (this.accept.emptySuit==-1)
				{
					if (this.accept.emptyRank==-1)
					{
						return true;
					}
					else
					{
						if (card.rank==this.accept.emptyRank)
							return true;
						else
							return false;
					}
				}
				else
				{
					if (this.accept.emptySuit==card.suit)
					{
						if (this.accept.emptyRank==-1)
						{
							return true;
						}
						else
						{
							if (card.rank==this.accept.emptyRank)
								return true;
							else
								return false;
						}
					}
					else
						return false;
				}
				return true;
			}
			else
				return false;
		}
		else{
			var topPile=this.cards[this.cards.length-1];
			if (this.accept.alternateSuit)
			{
				//requires alternate Suit
				if (topPile.isAlternateSuit(card))
				{
					//it is alternate Suit
					if (this.accept.sequential)
					{
//						console.log(this.accept)
//						console.log("it is alternate")
						var d=topPile.isSequential(card);
						if (
						(d!=0 && this.accept.direction=='') || 
						(d==-1 && this.accept.direction=='Desc') ||
						(d==1 && this.accept.direction=='Asc'))
						{
							//console.log("it is sequential")
							return true;
						}
						else
							return false;
					}
					else
						return true;
					return true;
				}
				else
				{
					return false;
				}
			}
			else
			{
				//same Suit
				if (topPile.isSomeSuit(card))
				{
					//console.log("it is same suit")
					var d=topPile.isSequential(card);
					//console.log("Sequential " + d)
					
					if (
					(d!=0 && this.accept.direction=='') || 
					(d==-1 && this.accept.direction=='Desc') ||
					(d==1 && this.accept.direction=='Asc'))
					{
						//console.log("it is sequential")
						return true;
					}
					else
						return false;
				}
				else
				{
					return false;
				}
			}
			//alternateColor,sequential,direction
		}
	}

	getTopCard(){
		if (this.cards.length>0)
			return this.cards[this.cards.length-1];
		else
			return new Card(-1,-1);
	}

    getFirstCard(){
		if (this.cards.length>0)
			return this.cards[0];
		else
			return new Card(-1,-1);
	}

	addCard(card){
		this.cards.push(card);
	}

    takeFirstCard(){
		if (this.cards.length>0){
			var C=this.cards[0];
			this.cards.splice(0,1);
			return C;
		}
		else
			return new Card(-1,-1);
	}

	takeTopCard(){
		if (this.cards.length>0){
			var C=this.cards[this.cards.length-1];
			this.cards.splice(this.cards.length-1,1);
			return C;
		}
		else
			return new Card(-1,-1);
	}
	
	debug() {
		var s="";
		for(var i=0;i<this.cards.length;i++)
		{
			s=s+this.cards[i].debug() + " ";
		}
		return s;
	}

	static moveCard(fromPile, toPile,currentPlayer) {
		var C=board.piles[fromPile].getTopCard()
        var b=board.piles[toPile].canDrop(C);
        //console.log(currentPlayer + "," + fromPile + "," + toPile)
        if ((currentPlayer==1 && fromPile==0 && toPile==1) || (currentPlayer==2 && fromPile==3 && toPile==4))
            b=true;

		//console.log(fromPile + "->" + toPile + "=" + b);
		if (b)
		{
			var C=board.piles[fromPile].takeTopCard();
			board.piles[toPile].addCard(C);
		}
	}

    static movePile(fromPile, toPile,currentPlayer) {
        //console.log("PILE MOVE " + currentPlayer + "," + fromPile + "," + toPile)
        var nCards=board.piles[fromPile].cards.length;
        for (var f=0;f<nCards;f++)
        {
            //console.log("moved " + f + " from " + fromPile + " to " + toPile)
            var C=board.piles[fromPile].takeFirstCard();
            board.piles[toPile].addCard(C);
        }
	}

}