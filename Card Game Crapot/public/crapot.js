class Accept{
	constructor (alternateSuit,sequential,direction,whenEmpty,emptySuit, emptyRank)
	{
		this.alternateSuit=alternateSuit; //Only accept alternate color
		this.sequential=sequential;         //Only accept sequential cards
		this.direction=direction;           //direction: 'Asc','Desc', ''
		this.whenEmpty=whenEmpty;           //accept a card when empty
		this.emptySuit=emptySuit;			//empty suit accepted suit (-1 any)
		this.emptyRank=emptyRank;			//empty rank accepted rank (-1 any)
	}
}
class Show{
	constructor(lastCard, allCards){
		this.lastCard=lastCard;
		this.allCards=allCards;
	}
}

class Utils {
	static getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
}



class Board{
	constructor(numberOfPiles, numberOfPlayers){
		this.piles=new Array(numberOfPiles);
		this.numberOfPlayers=numberOfPlayers;

		var d=new Deck(2);
		//console.log("DECK:" + d.debug());
		
		//var board=new Board(22,2);
		
		//lastCard, allCards
		var showMainPile=new Show(false,false);
		var showEmptyPile=new Show(true,true);
		var showCrapot=new Show(true,false);
		
		//alternateSuit,sequential,direction,whenEmpty, emptySuit, emptyRank
		var acceptMainPile=new Accept(false,true,'Asc',false, -1,-1);
		var acceptEmptyPile=new Accept(false,true,'',false, -1,-1);
		var acceptCrapot=new Accept(false,true,'',false, -1,-1);
		var acceptSide=new Accept(true,true,'Desc',true, -1,-1);
		var acceptCenter=new Accept(false,true,'Asc',true, -1,0);

		this.piles[0]=new Pile(0,d.takeCards(35),showMainPile,acceptMainPile);
		this.piles[1]=new Pile(1,[],showEmptyPile,acceptEmptyPile);
		this.piles[2]=new Pile(2,d.takeCards(13),showCrapot,acceptCrapot);

		this.piles[3]=new Pile(3,d.takeCards(35),showMainPile,acceptMainPile);
		this.piles[4]=new Pile(4,[],showEmptyPile,acceptEmptyPile);
		this.piles[5]=new Pile(5,d.takeCards(13),showCrapot,acceptCrapot);

		for (var i=0;i<4;i++){
			this.piles[6+i*4]=new Pile(6+i*4,d.takeCards(1),showEmptyPile,acceptSide);
			this.piles[7+i*4]=new Pile(7+i*4,[],showEmptyPile,acceptCenter);
			this.piles[8+i*4]=new Pile(8+i*4,[],showEmptyPile,acceptCenter);
			this.piles[9+i*4]=new Pile(9+i*4,d.takeCards(1),showEmptyPile,acceptSide);
		}

		this.allowedPiles=new Array(22);
		this.pickedPile=-1;
		this.currentPlayer=1;
	}

	togglePlayer(pile){
		if ((this.currentPlayer==1 && this.pickedPile==0 && pile==1) || (this.currentPlayer==2 && this.pickedPile==3 && pile==4))
		{
			this.currentPlayer=3-this.currentPlayer;
		}
	}

	numberOfSideEmptyPiles(){
		var n=0;
		for(var f=0;f<4;f++){
			if (this.piles[6+f*4].cards.length==0)
				n++;
			if (this.piles[9+f*4].cards.length==0)
				n++;
		}
		return n;
	}

	checkCard(fromPile,topOrFirst){
		this.pickedPile=fromPile;
		if (topOrFirst=="top")
			var C=this.piles[fromPile].getTopCard();
		else
			var C=this.piles[fromPile].getFirstCard();

		this.allowedPiles=[];
		for (var t=0;t<22;t++){
			if (this.piles[t].canDrop(C))
			{
				//console.log("ALLOWED:" + t);
				this.allowedPiles[t]=true;
			}
			else{
				//CHECK PLAYER MOVES
				if ((this.currentPlayer==1 && fromPile==0 && t==1) || (this.currentPlayer==2 && fromPile==3 && t==4))
					this.allowedPiles[t]=true;
				else
					this.allowedPiles[t]=false;
			}
			if ((t==2 && this.currentPlayer==1) || (t==5 && this.currentPlayer==2))
			{
				//TODO: NEED TO CHECK CRAPOT MOVE
				if (this.numberOfSideEmptyPiles()<0){
					this.allowedPiles[t]=false;
				}
			}
			if(this.piles[fromPile].cards.length==0)
				this.allowedPiles[t]=false;
			//CAN'T PLAY OTHER PLAYER'S CARDS
			if ((this.currentPlayer==2 && (fromPile==0 || fromPile==1 || fromPile==2))
				|| (this.currentPlayer==1 && (fromPile==3 || fromPile==4 || fromPile==5)))
				{
					this.allowedPiles[t]=false;
					console.log ("blocked")
				}
		}	
	}

	debugAllowedPiles(){
		var ss="";
		for(var g=0;g<22;g++)
		{
			if (this.allowedPiles[g])
				ss+=g + ",";
		}
		if (ss!="")
			console.log("POSSIBLE:" + ss);
	}
}

function PossibleMoveCenter(pile){
	board.checkCard(pile,"top");

	//board.debugAllowedPiles();

	for(var i=0;i<4;i++){
		if (board.allowedPiles[7+i*4])
		{
			return 7+i*4;
		}
		if (board.allowedPiles[8+i*4])
		{
			return 8+i*4;
		}
	}
	return -1;
}

var LastPileFrom=-1;
var LastPileTo=-1;
function MoveCard(pileFrom,pileTo)
{
	LastPileFrom=pileFrom;
	LastPileTo=pileTo;
	console.log("MOVE CARD " + LastPileFrom + " TO " + LastPileTo)
	if (board.piles[pileFrom].cards.length==0)
	{
		console.log("ERROR MoveCard")
	}
	Pile.moveCard(pileFrom,pileTo,board.currentPlayer);
	render();
}

function MovePile(pileFrom,pileTo,player)
{
	LastPileFrom=pileFrom;
	LastPileTo=pileTo;
	console.log("MOVE PILE " + LastPileFrom + " TO " + LastPileTo)
	if (board.piles[pileFrom].cards.length==0)
	{
		console.log("ERROR MoveCard")
	}
	Pile.movePile(pileFrom,pileTo,board.currentPlayer);
	render();
}


function AIStrategy(){
	//FROM SIDE TO THE MIDDLE
	var sidePile=[6,9,10,13,14,17,18,21];
	for(var f=0;f<sidePile.length;f++){
		var to=PossibleMoveCenter(sidePile[f]);
		if (to!=-1)
		{
			MoveCard(sidePile[f],to);
			return;
		}
	}
	
	//FROM SIDE HOME TO SIDE
	var topCards=new Array(8);
	for(var f=0;f<sidePile.length;f++){
		topCards[f]={pile:sidePile[f], card:board.piles[sidePile[f]].getFirstCard(), numCards:board.piles[sidePile[f]].cards.length};
	}
	var nEmpty=board.numberOfSideEmptyPiles();
	//SORT BY CARD RANK
	topCards.sort(function(a,b){return b.card.rank-a.card.rank;});
	for(var f=0;f<8;f++){
		board.checkCard(topCards[f].pile,"first");
		//console.log("F:" + f + "," + topCards[f].pile + "->" + topCards[f].numCards);
		//board.debugAllowedPiles();
		if (topCards[f].numCards-nEmpty<=1 && topCards[f].numCards>0)
		{
			//console.log("CAN MOVE F:" + f +"," + topCards[f].pile + "," + topCards[f].numCards);
			for(var i=0;i<sidePile.length;i++){
				if (board.allowedPiles[sidePile[i]])// && LastPileFrom!=sidePile[i] && LastPileTo!=topCards[f].pile)
				{
					if (board.piles[sidePile[i]].cards.length>0)
					{
						MovePile(topCards[f].pile, sidePile[i]);
						return;
					}
				}
			}
		}
	}

	//GET topcards
	topCards=new Array(8);
	for(var f=0;f<sidePile.length;f++){
		topCards[f]={pile:sidePile[f], card:board.piles[sidePile[f]].getTopCard(), numCards:board.piles[sidePile[f]].cards.length};
	}
	//SORT BY CARD RANK
	topCards.sort(function(a,b){return b.card.rank-a.card.rank;});
	//console.log(LastPileFrom + " " + LastPileTo)
	for(var f=0;f<sidePile.length;f++){
		//console.log(topCards[f].card);
		board.checkCard(topCards[f].pile,"top");

		for(var i=0;i<sidePile.length;i++){
			if (board.allowedPiles[sidePile[i]] && LastPileFrom!=sidePile[i] && LastPileTo!=topCards[f].pile)
			{
				if (topCards[f].numCards<=board.piles[sidePile[i]].cards.length)
				{
					MoveCard(topCards[f].pile, sidePile[i]);
					return;
				}
			}
		}
	
	}
}


window.onload=render;

var board=new Board(22,2);

function renderT(n){
	return "<div class='pileHost' id=t" + n + "'>";
}
function renderL(){
	return "<div class='pileHostLeft'>";
}
function renderC(){
	return "<div class='pileHostCenter'>";
}
function renderR(){
	return "<div class='pileHostRight'>";
}
function render() {
	//console.log("RENDER")
	//checkCard(1);

	var s="";
		for (var i=0;i<4;i++){
			s+="<div class=row>" + renderL();
			if (board.piles[6+i*4].cards.length==0)
				s+=new Card(-1,-1).render("style='left:" + (12*15) + "px;'",6+i*4);
			for(var j=0;j<board.piles[6+i*4].cards.length;j++)
			{
				s+=board.piles[6+i*4].cards[j].render("style='left:" + ((12-j)*15) + "px;'",6+i*4);
			}
			
			s+="</div>" + renderC() + 
			board.piles[7+i*4].getTopCard().render("",7+i*4)
			+"</div>" + renderC() + 
			board.piles[8+i*4].getTopCard().render("",8+i*4)
			+"</div>" + renderR();
			if (board.piles[9+i*4].cards.length==0)
				s+=new Card(-1,-1).render("",9+i*4);
			for(var j=0;j<board.piles[9+i*4].cards.length;j++)
			{
				s+=board.piles[9+i*4].cards[j].render("style='left:" + (j*15) + "px;'",9+i*4);
			}
			s+="</div></div>";
		}
		boardDiv.innerHTML=s;

		var sPlaying="";
		if (board.currentPlayer==1)
			sPlaying=" playing";
		s="<div id='p1' class='player p1" + sPlaying + "'>Player 1" + "<div class=row>";
		for (var i=0;i<3;i++){
			if (board.piles[i].show.lastCard || i==mandatoryPileFrom)
				s+=renderC() + board.piles[i].getTopCard().render("",i) + "</div>";
			else
				s+=renderC() + new Card(-2,-2).render("onclick='openPlayerCard(" + i + ")'",i) + "</div>";
		}
		s+="</div>"
		s+="</div>"

		if (board.currentPlayer==2)
			sPlaying=" playing";
		else
			sPlaying="";
		s+="<div id='p2' class='player p2" + sPlaying + "'>Player 2" + "<div class=row>";
		for (var i=3;i<6;i++){
			if (board.piles[i].show.lastCard || i==mandatoryPileFrom)
				s+=renderC() + board.piles[i].getTopCard().render("",i) + "</div>";
			else
				s+=renderC() + new Card(-2,-2).render("onclick='openPlayerCard()'",i) + "</div>";
		}
		s+="</div>"
		s+="</div>"
		playersDiv.innerHTML=s;
	

}

var mandatoryPileFrom=-1;
function openPlayerCard(){
	if (board.currentPlayer==1)
		mandatoryPileFrom=0;
	else
		mandatoryPileFrom=3;
	render();
}

interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    // restrict: {
    //   restriction: "parent",
    //   endOnly: true,
    //   elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    // },
    // enable autoScroll
	autoScroll: false,

	onstart: function (event) {
		board.checkCard(event.target.getAttribute("pile"),"top");
	},

    // call this function on every dragmove event
    onmove: dragMoveListener,
    // call this function on every dragend event

	onend: function (event) {
		//console.log("onend")
		event.target.style.transform="";
		event.target.setAttribute("data-x","");
		event.target.setAttribute("data-y","");
		//   var textEl = event.target.querySelector('p');

    //   textEl && (textEl.textContent =
    //     'moved a distance of '
    //     + (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
    //                  Math.pow(event.pageY - event.y0, 2) | 0))
    //         .toFixed(2) + 'px');
    }
  });

  interact('.dropable').dropzone({
	// only accept elements matching this CSS selector
	// Require a 75% element overlap for a drop to be possible
	accept: '.dropable',
	overlap: 0.4,
  
	// listen for drop related events:

	ondropactivate: function (event) {
	  // add active dropzone feedback
	},
	ondragenter: function (event) {
	  var draggableElement = event.relatedTarget,
		  dropzoneElement = event.target;
  
	  // feedback the possibility of a drop
	  dropzoneElement.classList.add('drop-target');
	//   draggableElement.classList.add('can-drop');
	},
	ondragleave: function (event) {
		//console.log("ondragleave");
	  // remove the drop feedback style
	   event.target.classList.remove('drop-target');
	//   event.relatedTarget.classList.remove('can-drop');
	},
	ondrop: function (event) {
		var pile=event.target.getAttribute("pile");
		//console.log("Pile:" + pile)
		//console.log("DROP IN:" + pile + "->" + board.allowedPiles[pile*1]);
		if (!board.allowedPiles[pile*1]){
			console.log(board.piles[pile].cards.length);
			for (var f=0;f<board.piles[pile].cards.length;f++){
				console.log(f + "-" + board.piles[pile].cards[f].suit + "-" + board.piles[pile].cards[f].rank)
			}
		}
		if (board.allowedPiles[pile*1]==true && (mandatoryPileFrom==-1 || mandatoryPileFrom==board.pickedPile))
		{
			//console.log("DROPPED:" + pile)
			mandatoryPileFrom=-1;
			//change player
			MoveCard(board.pickedPile, pile)
			board.togglePlayer(pile);
		}
		else{
			console.log("NOT DROPPED")
		}
	},
	ondropdeactivate: function (event) {
		//console.log("ondropdeactivate");
	  // remove active dropzone feedback
	  event.target.classList.remove('drop-target');
	}
  });

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  // this is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;