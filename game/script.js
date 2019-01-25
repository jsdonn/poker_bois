var myName = localStorage.getItem("username"); // need to send this to matin
var myIndex = -1; // will set later 
var inPlayers = [];
var newRound = true;

var holeCards;
var riverHoleCards;
var communityCards;
var currPlayerTurn;
var numPlayers;
var dealer;
var smallBlind;
var bigBlind;
var bets;
var stacks;
var playerNames;
var pot;

var source = new EventSource("____________");
var dataArray;
source.onmessage = function(event) {
	dataDict = event.data;
	holeCards = dataDict["hole_cards"];
	riverHoleCards = dataDict["river_hole_cards"]; // make this at the end???
	communityCards = dataDict["board_cards"];
	currPlayerTurn = dataDict["cur_turn"];
	numPlayers = dataDict["num_players"];
	// if the dealer position has moved, it is a new round
	if (dealer != dataDict["dealer"]) {
		newRound = true;
	} else {
		newRound = false;
	}
	dealer = dataDict["dealer"];
	smallBlind = dataDict["sb"];
	bigBlind = dataDict["bb"];
	// display small/big blind in the corner, just need to do it once
	bets = dataDict["bets"];
	stacks = dataDict["stacks"];
	playerNames = dataDict["names"];
	pot = dataDict["pot"];
	if (myIndex < 0) {
		myIndex = playerNames.indexOf(myName);
	} // should only have to do the first time
	// reset inPlayers and hide fold message at the start of each new round 
	if (newRound) {
		inPlayers = [];
		for (i = 0; i < numPlayers; i++) {
			inPlayers.push(i);
		}
		document.getElementById("fold-message").style.visibility = "hidden";
	}
	// update playerspaces (make visible if the player exists)
	for (i = 0; i < numPlayers; i++) {
		document.getElementById("p" + i.toString()).getElementsByClassName("toggle-visibility")[0].style.visibility = "visible";
	}
	updateVariables();
}

function updateVariables() {
	updateCards("first-card", holeCards[0]); // hole card 1 @ interface
	updateCards("second-card", holeCards[1]); // hole card 2 @ interface
	updateCards("first-p" + ((myIndex + 1).toString()), holeCards[0]); // hole card 1 @ playerspace
	updateCards("second-p" + ((myIndex + 1).toString()), holeCards[1]); // hole card 2 @ playerspace
	updateCommunityCards(); // flop, turn, river
	updateCurrentTurn();
	updateDealerStacksAndNames();
	updateBetsAndFolds();
}

function updateCards(cardID, fileName) {
	var x = document.getElementById(cardID);
	x.setAttribute("src", "../images/cards/" + fileName + "png");
}

function updateCommunityCards() {
	var flop1 = communityCards[0];
	var flop2 = communityCards[1];
	var flop3 = communityCards[2];
	var turn1 = communityCards[3];
	var river1 = communityCards[4];
	if (flop1 > -1) {
		updateCards("flop1", flop1 + ".png");
		document.getElementById("flop1").style.visibility = "visible";
	}
	if (flop2 > -1) {
		updateCards("flop2", flop2 + ".png");
		document.getElementById("flop2").style.visibility = "visible";
	}
	if (flop3 > -1) {
		updateCards("flop3", flop3 + ".png");
		document.getElementById("flop3").style.visibility = "visible";
	}
	if (turn1 > -1) {
		updateCards("turn1", turn1 + ".png");
		document.getElementById("turn1").style.visibility = "visible";
	}
	if (river1 > -1) {
		updateCards("river1", river1 + ".png");
		document.getElementById("river1").style.visibility = "visible";
	}
}

function updateCurrentTurn() {
	var actualCurrPlayer = currPlayerTurn + 1;
	document.getElementById("p" + actualCurrPlayer.toString()).style.backgroundColor = "deepskyblue";
	if (actualCurrPlayer == myIndex) {
		showUserInput();
	} else {
		hideUserInput();
	}
	// no idea if any of this works
}

function hideUserInput () {
	var toHide = document.getElementById("user-input").getElementsByClassName("toggle-visibility")[0];
	toHide.style.visibility = 'hidden';
	/* no idea if this works */ 
}

function showUserInput () {
	var toShow = document.getElementById("user-input").getElementsByClassName("toggle-visibility")[0];
	toHide.style.visibility = 'visible';
	/* no idea if this works */
}

/* function updateDealer() {
	var actualDealer = dealer + 1;
	for (i = 0; i < numPlayers; i++) {
		if (i == actualDealer) {
			document.getElementById("dealer-chip-p" + actualDealer.toString()).style.visibility = "visible";
		} else {
			document.getElementById("dealer-chip-p" + actualDealer.toString()).style.visibility = "hidden";
		}
	}
	// no idea if this works
} */

function updateDealerStacksAndNames() {
	var actualPlayer;
	var actualDealer = dealer + 1;
	for (i = 0; i < numPlayers; i++) {
		actualPlayer = i + 1;
		document.getElementById("stack-p" + actualPlayer.toString()).innerHTML = stacks[i].toString();
		if (i == actualDealer) {
			document.getElementById("dealer-chip-p" + actualDealer.toString()).style.visibility = "visible";
		} else {
			document.getElementById("dealer-chip-p" + actualDealer.toString()).style.visibility = "hidden";
		}
		document.getElementById("player" + actualPlayer.tostring()).innerHTML = playerNames[i];
	}
	// dunno if this works either
}

function updateBetsAndFolds() {
	var actualPlayer;
	var removed = 0;
	for (i = 0; i < numPlayers; i++) {
		actualPlayer = i + 1;
		if (bets[i] < 0) { // fold
			inPlayers.splice(i - removed, 1);
			removed++;
			document.getElementById("first-p" + actualPlayer.toString()).style.visibility = "hidden";
			document.getElementById("second-p" + actualPlayer.toString()).style.visibility = "hidden";
			document.getElementById("fold-message").style.visibility = "visible";
			// does this work? first-p# and second-p# don't have visibility attributes
		} else { // check or call or raise
			document.getElementById("bet-size-p" + actualPlayer.toString()).innerHTML = bets[i].toString();
		}
	} // not sure if this correctly removes players from inPlayers
}

function changeRaise(scalar) {
	var raiseSize = scalar * pot;
	document.getElementById("raise-amount").value = Math.floor(raiseSize).toString();
	// dunno if this works
}

document.getElementById("player1").innerHTML = localStorage.getItem("username");
document.getElementById("stack-p1").innerHTML = localStorage.getItem("buyIn");
