var holeCards;
var communityCards;
var currPlayerTurn;
var numPlayers;
var dealer;
var smallBlind;
var bigBlind;
var bets;
var stacks;
var playerCards;

var source = new EventSource("____________");
var dataArray;
source.onmessage = function(event) {
	dataArray = event.data;
	holeCards = dataArray.slice(0, 2);
	communityCards = dataArray.slice(2, 7);
	currPlayerTurn = dataArray.slice(7, 8);
	numPlayers = dataArray.slice(8, 9);
	dealer = dataArray.slice(9, 10);
	smallBlind = dataArray.slice(10, 11);
	bigBlind = dataArray.slice(11, 12);
	bets = dataArray.slice(12, 21);
	stacks = dataArray.slice(21, 30);
	playerCards = dataArray.slice(30, 48);
}

function updateVariables() {
	updateCards("first-card", holeCards[0] + ".png"); // hole card 1
	updateCards("second-card", holeCards[1] + ".png"); // hole card 2
	updateCommunityCards(); // flop, turn, river


}

function updateCards(cardID, fileName) {
	var x = document.getElementById(cardID);
	x.setAttribute("src", fileName);
}

function updateCommunityCards() {
	var flop1 = communityCards[0];
	var flop2 = communityCards[1];
	var flop3 = communityCards[2];
	var turn1 = communityCards[3];
	var river1 = communityCards[4];
	if (flop1 > -1) {
		updateCards("flop1", flop1 + ".png");
	}
	if (flop2 > -1) {
		updateCards("flop2", flop2 + ".png");
	}
	if (flop3 > -1) {
		updateCards("flop3", flop3 + ".png");
	}
	if (turn1 > -1) {
		updateCards("turn1", turn1 + ".png");
	}
	if (river1 > -1) {
		updateCards("river1", river1 + ".png");
	}
}

function hideUserInput () {
	var toHide = document.getElementById("user-input");
	toHide.style.display = 'none';
	/* no idea if this works */ 
}

function showUserInput () {
	var toShow = document.getElementById("user-input");
	toHide.style.display = 'inline-block';
	/* no idea if this works */
}

document.getElementById("player1").innerHTML = localStorage.getItem("username");
document.getElementById("stack-p1").innerHTML = localStorage.getItem("buyIn");
