// TODO: fold pile
// 		 display check/fold/raise etc text when people make those actions. DONE
// 		 river hole cards
//		 animations for text appearing and disappearing. fix this asap
//		 display small/big blinds
//		 auto check/auto fold
//		 clock animation
//		 straddle, left, right (show cards) = toggle
//	   	 all in button 
//		 clear raise textbox after hitting a button done : i think
//		 leave game = close the tab
//		 fold message doesn't work
// 		 number the players clockwise

var ws = new WebSocket("ws://poker.mkassaian.com:8080");
var myName = localStorage.getItem("username").trim().substring(0, 15);
var myBuyIn = localStorage.getItem("buyin");
ws.onopen=(e)=>ws.send(myBuyIn + " " + myName);
var interval = setInterval(()=>ws.send("1"), 1200);
ws.onerror=(e)=>error(e);
ws.onclose=(e)=>window.location.replace("../images/emile1.png"); // does work
function error(e) {
	console.log(e.data);
	clearInterval(interval);
}
var myIndex = -1; // this is set when client receives data from server later
var inPlayers = [];
var newRound = true;
//var newBettingRound = true;
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
var folded;

var dataArray;
ws.onmessage = function(event) {
	dataDict = JSON.parse(event.data);
	holeCards = dataDict["hole_cards"];
	// TODO: display the cards of all players who make it to the end of the river
	riverHoleCards = dataDict["river_hole_cards"]; // make this at the end???
	currPlayerTurn = dataDict["cur_turn"];
	numPlayers = dataDict["num_players"];
	smallBlind = dataDict["sb"];
	bigBlind = dataDict["bb"];
	// display small/big blind in the corner, just need to do it once
	bets = dataDict["bets"];
	stacks = dataDict["stacks"];
	playerNames = dataDict["names"];
	pot = dataDict["pot"];
	folded = dataDict["folded"];

	if (!veryFirst) {
		// if the dealer position has moved, it is a new round
		if (dealer != dataDict["dealer"]) {
			newRound = true;
		} else {
			newRound = false;
		}

		// if there are a differing number of -1's between board cards, it is a new betting round
		if (countInArray(communityCards, -1) != countInArray(dataDict["board_cards"], -1)) {
			newBettingRound = true;
		} else {
			newBettingRound = false;
		} 
	}

	// this has to be after the new round check!!
	dealer = dataDict["dealer"];

	// this has to be after the new betting round check!!
	communityCards = dataDict["board_cards"];

	// set myIndex, should only have to do once
	myIndex = playerNames[myName];

	// reset inPlayers and hide fold message at the start of each new round 
	if (newRound) {
		inPlayers = [];
		for (i = 0; i < numPlayers; i++) {
			inPlayers.push(i);
		}
		resetGame();
		document.getElementById("fold-message").style.visibility = "hidden";
	}

	// update playerspaces (make visible if the player exists)
	for (i = 0; i < numPlayers; i++) {
		document.getElementById("p" + i.toString()).getElementsByClassName("toggle-visibility")[0].style.visibility = "visible";
	}

	/* if (typeof prevTurn == "undefined") {
		prevTurn = (currPlayerTurn -1) % numPlayers;
		prevAction = "";
	} */

	/* if (typeof prevTurn != "undefined" && prevTurn != (currPlayerTurn -1) % numPlayers) {
		animateAction(prevTurn, prevAction);
	} */
	/*if (newBettingRound) {

	} */
	var nextPersonsTurn = (prevTurn != (currPlayerTurn -1) % numPlayers);
	// prevTurn = (currPlayerTurn -1) % numPlayers;

	// find prevAction
	//if (!newBettingRound) {
		if (folded[prevTurn] == 1) {
			prevAction = "Fold";
		} else if (bets[prevTurn] == 0) {
			prevAction = "Check";
		} else {
			var tempMax = 0;
			for (i = 0; i < numPlayers; i++) {
				if (prevTurn != i && bets[i] > tempMax) {
					tempMax = bets[i];
				}
			}
			if (bets[prevTurn] > tempMax) {
				prevAction = "Raise to " + bets[prevTurn].toString();
			} else {
				prevAction = "Call " + tempMax.toString();
			}
		}
	/*} else {
		prevAction = false;
	} */
	if (!veryFirst && (nextPersonsTurn)) {
		animateAction(prevTurn, prevAction);
		nextPersonsTurn = false;		
	}
	prevTurn = currPlayerTurn;
	
	updateVariables();
	if (riverHoleCards.length != 0 && inPlayers.length != 0) {
		showHoleCardsAtEnd();
	}
	veryFirst = false;
}


function updateVariables() {
	updateHoleCards();
	updateCommunityCards(); // flop, turn, river
	updateCurrentTurn(); // show user input if it's my turn, change current player's background to blue
	updateDealerStacksAndNames();
	updateBetsAndFolds();
	updatePot();
}

function countInArray(array, element) {
	var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] == element) {
            count++;
        }
    }
    return count;
}

function updateCards(cardID, fileName, playingCard) {
	var x = document.getElementById(cardID);
	if (playingCard) {
		x.setAttribute("src", "../images/cards/" + fileName.toUpperCase() + ".png");
	} else {
		x.setAttribute("src", "../images/cards/" + fileName + ".png");
	}
}

function updateHoleCards() {
	if (holeCards[0] != -1) {
		updateCards("first-card", holeCards[0], true); // hole card 1 @ interface
		updateCards("second-card", holeCards[1], true); // hole card 2 @ interface
		updateCards("first-p" + (myIndex.toString()), holeCards[0], true); // hole card 1 @ playerspace
		updateCards("second-p" + (myIndex.toString()), holeCards[1], true); // hole card 2 @ playerspace
	}
}

function updateCommunityCards() {
	var flop1 = communityCards[0];
	var flop2 = communityCards[1];
	var flop3 = communityCards[2];
	var turn1 = communityCards[3];
	var river1 = communityCards[4];
	if (flop1 != -1) {
		updateCards("flop1", flop1, true);
		document.getElementById("flop1").style.visibility = "visible";
	} else {
		updateCards("flop1", "blue_back", false);
		document.getElementById("flop1").style.visibility = "hidden";
	}
	if (flop2 != -1) {
		updateCards("flop2", flop2, true);
		document.getElementById("flop2").style.visibility = "visible";
	} else {
		updateCards("flop2", "blue_back", false);
		document.getElementById("flop2").style.visibility = "hidden";
	}
	if (flop3 != -1) {
		updateCards("flop3", flop3, true);
		document.getElementById("flop3").style.visibility = "visible";
	} else {
		updateCards("flop3", "blue_back", false);
		document.getElementById("flop3").style.visibility = "hidden";
	}
	if (turn1 != -1) {
		updateCards("turn1", turn1, true);
		document.getElementById("turn1").style.visibility = "visible";
	} else {
		updateCards("turn1", "blue_back", false);
		document.getElementById("turn1").style.visibility = "hidden";
	}
	if (river1 != -1) {
		updateCards("river1", river1, true);
		document.getElementById("river1").style.visibility = "visible";
	} else {
		updateCards("river1", "blue_back", false);
		document.getElementById("river1").style.visibility = "hidden";
	}
}

function clearBoard() {
	updateCards("flop1", "blue_back", false);
	document.getElementById("flop1").style.visibility = "hidden";
	updateCards("flop2", "blue_back", false);
	document.getElementById("flop2").style.visibility = "hidden";
	updateCards("flop3", "blue_back", false);
	document.getElementById("flop3").style.visibility = "hidden";
	updateCards("turn1", "blue_back", false);
	document.getElementById("turn1").style.visibility = "hidden";
	updateCards("river1", "blue_back", false);
	document.getElementById("river1").style.visibility = "hidden";
}

function resetGame() {
	for (i = 0; i < numPlayers; i++) {
		updateCards("first-p" + i.toString(), "blue_back", false);
		updateCards("second-p" + i.toString(), "blue_back", false);
	}
	updateCards("first-card", "blue_back", false);
	updateCards("second-card", "blue_back", false); 
	clearBoard();
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
	// i think this works
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
		if (bets[i] == -1) { // fold
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
	} // not sure if this correctly removes players from inPlayers but fairly confident
}

function showHoleCardsAtEnd() {
	window.alert("p0 c0: " + riverHoleCards[0][0].toString());
	window.alert("p0 c1: " + riverHoleCards[0][1].toString());
	window.alert("p1 c0: " + riverHoleCards[1][0].toString());
	window.alert("p1 c1: " + riverHoleCards[1][1].toString());

	for (i = 0; i < inPlayers.length; i++) {
		updateCards("first-p" + i.toString(), riverHoleCards[i][0], true);
		updateCards("second-p" + i.toString(), riverHoleCards[i][1], true);
	}
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
	// very confident this works, just need to clear after your turn is over
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
	if (arg == "allin") {
		data = "0 " + (stacks[myIndex] + bets[myIndex]).toString();
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
	document.getElementById("raise-amount").value = "";
	ws.send(data);
}
