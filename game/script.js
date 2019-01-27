// TODO: fold pile
// 		 display check/fold/raise etc text when people make those actions. DONE
// 		 river hole cards
//		 animations for text appearing and disappearing. fix this asap
//		 find actual backgrounds for everything. DONE
//		 display pot.  DONE
//		 display small/big blinds
//		 auto check/auto fold
//		 clock animation
//		 straddle, left, right (show cards) = toggle
//	   	 all in button 
//		 clear raise textbox after hitting a button
//		 leave game = close the tab

var ws = new WebSocket("ws://poker.mkassaian.com:8080");
var myName = localStorage.getItem("username").trim().substring(0, 15);
var myBuyIn = localStorage.getItem("buyin");
ws.onopen=(e)=>ws.send(myBuyIn + " " + myName);
var interval = setInterval(()=>ws.send("1"), 1000);
ws.onerror=(e)=>error(e);
ws.onclose=(e)=>close(e);
function error(e) {
	console.log(e.data);
	clearInterval(interval);
}
function close(e) {
	console.log(e.data);
	clearInterval(interval);
	window.close();
}
var myIndex = -1; // this is set when client receives data from server
var inPlayers = [];
var newRound = true;
var prevTurn;
var prevAction;
var veryFirst = true;

// data to be received from server
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


var dataArray;
ws.onmessage = function(event) {
	dataDict = JSON.parse(event.data);
	holeCards = dataDict["hole_cards"];
	// TODO: display the cards of all players who make it to the end of the river
	riverHoleCards = dataDict["river_hole_cards"]; // make this at the end???
	communityCards = dataDict["board_cards"];
	currPlayerTurn = dataDict["cur_turn"];
	if (veryFirst) {
		prevAction = "";
		prevTurn = currPlayerTurn;
		veryFirst = false;
	}
	if (typeof prevTurn !== "undefined" && prevTurn != currPlayerTurn) {
		animateAction(prevTurn, prevAction);
	}
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

	// set myIndex, should only have to do once
	if (myIndex < 0) {
		myIndex = playerNames[myName];
	}

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

	// find prevAction
	if (bets[currPlayerTurn] == 0) {
		prevAction = "Check";
	} else if (bets[currPlayerTurn] == -1) {
		prevAction = "Fold";
	} else {
		var tempMax = 0;
		for (i = 0; i < numPlayers; i++) {
			if (currPlayerTurn != i && bets[i] > tempMax) {
				tempMax = bets[i];
			}
		}
		if (bets[currPlayerTurn] > tempMax) {
			prevAction = "Raise to " + bets[currPlayerTurn].toString();
		} else {
			prevAction = "Call " + bets[tempMax];
		}
	}
	updateVariables();
}

function updateVariables() {
	updateHoleCards();
	updateCommunityCards(); // flop, turn, river
	updateCurrentTurn(); // show user input if it's my turn, change current player's background to blue
	updateDealerStacksAndNames();
	updateBetsAndFolds();
	updatePot();
}

function updateCards(cardID, fileName) {
	var x = document.getElementById(cardID);
	x.setAttribute("src", "../images/cards/" + fileName.toUpperCase() + ".png");
}

function updateHoleCards() {
	if (holeCards[0] != -1) {
		updateCards("first-card", holeCards[0]); // hole card 1 @ interface
		updateCards("second-card", holeCards[1]); // hole card 2 @ interface
		updateCards("first-p" + (myIndex.toString()), holeCards[0]); // hole card 1 @ playerspace
		updateCards("second-p" + (myIndex.toString()), holeCards[1]); // hole card 2 @ playerspace
	}
}

function updateCommunityCards() {
	var flop1 = communityCards[0];
	var flop2 = communityCards[1];
	var flop3 = communityCards[2];
	var turn1 = communityCards[3];
	var river1 = communityCards[4];
	if (flop1 != -1) {
		updateCards("flop1", flop1);
		document.getElementById("flop1").style.visibility = "visible";
	} else {
		document.getElementById("flop1").style.visibility = "hidden";
	}
	if (flop2 != -1) {
		updateCards("flop2", flop2);
		document.getElementById("flop2").style.visibility = "visible";
	} else {
		document.getElementById("flop2").style.visibility = "hidden";
	}
	if (flop3 != -1) {
		updateCards("flop3", flop3);
		document.getElementById("flop3").style.visibility = "visible";
	} else {
		document.getElementById("flop3").style.visibility = "hidden";
	}
	if (turn1 != -1) {
		updateCards("turn1", turn1);
		document.getElementById("turn1").style.visibility = "visible";
	} else {
		document.getElementById("turn1").style.visibility = "hidden";
	}
	if (river1 != -1) {
		updateCards("river1", river1);
		document.getElementById("river1").style.visibility = "visible";
	} else {
		document.getElementById("river1").style.visibility = "hidden";
	}
}

function updateCurrentTurn() {
	document.getElementById("p" + currPlayerTurn.toString()).style.backgroundColor = "deepskyblue";
	document.getElementById("p" + ((currPlayerTurn - 1 + numPlayers) % numPlayers).toString()).style.backgroundColor = "rgba(150, 150, 150, .8)";
	/* if (actualCurrPlayer == myIndex) {
		// display current bet on Call button
		document.getElementById("call").innerHTML = "Call " + Math.max(bets).toString();
		showUserInput();
	} else {
		hideUserInput();
	} */
	// FIX THIS
	// no idea if any of this works
}

function hideUserInput () {
	var toHide = document.getElementById("user-input").getElementsByClassName("toggle-visibility")[0];
	toHide.style.visibility = 'hidden';
	/* no idea if this works */ 
}

function showUserInput () {
	var toShow = document.getElementById("user-input").getElementsByClassName("toggle-visibility")[0];
	toShow.style.visibility = 'visible';
	/* no idea if this works */
}

function updateDealerStacksAndNames() {
	for (i = 0; i < numPlayers; i++) {
		document.getElementById("stack-p" + i.toString()).innerHTML = stacks[i].toString();
		if (i == dealer) {
			document.getElementById("dealer-chip-p" + i.toString()).style.visibility = "visible";
		} else {
			document.getElementById("dealer-chip-p" + i.toString()).style.visibility = "hidden";
		}
		document.getElementById("player" + i.toString()).innerHTML = Object.keys(playerNames).find(key=>playerNames[key] === i); //does this work
	}
	// dunno if this works either
}

function updateBetsAndFolds() {
	var removed = 0;
	for (i = 0; i < numPlayers; i++) {
		if (bets[i] < 0) { // fold
			inPlayers.splice(i - removed, 1);
			removed++;
			document.getElementById("first-p" + i.toString()).style.visibility = "hidden";
			document.getElementById("second-p" + i.toString()).style.visibility = "hidden";
			document.getElementById("fold-message").style.visibility = "visible";
			/* animateAction(i, "Fold"); */
		} else { // check or call or raise
			/*if (bets[i] == 0) {
				animateAction(i, "Check");
			} else {
				animateAction(i, "Raise to " + bets[i].toString());
			} */
			document.getElementById("bet-size-p" + i.toString()).innerHTML = bets[i].toString();
		}
	} // not sure if this correctly removes players from inPlayers
}

function animateAction(playerID, message) {
	var player = document.getElementById("action-text-p" + playerID.toString());
	player.querySelector(".action-text p").innerHTML = message;
	player.classList.add("action-text-transition");
	setTimeout(function() {
		player.classList.remove("action-text-transition");
	}, 1000);
	// pretty sure this works actually
}


function changeRaise(scalar) {
	var raiseSize = scalar * pot;
	document.getElementById("raise-amount").value = Math.floor(raiseSize).toString();
	// dunno if this works
}

function updatePot() {
	document.getElementById("pot-display").querySelector("h5").innerHTML = "Pot: " + pot.toString();
}

function send(arg) {
	var data;
	if (arg == "raise") {
		data = "0 " + document.getElementById("raise-amount").value;
	}
	if (arg == "check/call") {
		var maxBet = Math.max.apply(null, bets);
		if (maxBet > stacks[myIndex]) {
			data = "0 " + stacks[myIndex].toString();
		} else {
			data = "0 " + maxBet.toString();
		}
	}
	if (arg == "leave") {
		data = "";
	}
	if (arg == -1) {
		data = "0 -1";
	}
	if (typeof arg === "number") {
		data = "0 " + arg.toString();
	}
	ws.send(data);
}
