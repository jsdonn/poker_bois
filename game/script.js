// TODO: fold pile
// 		 display check/fold/raise etc text when people make those actions. DONE
// 		 river hole cards
//		 animations for text appearing and disappearing. fix this asap
//		 display small/big blinds
//		 auto check/auto fold
//		 clock animation
//		 straddle, left, right (show cards) = toggle
//	   	 all in button DONE
//		 clear raise textbox after hitting a button done : i think
//		 leave game = close the tab
//		 fold message doesn't work
// 		 number the players clockwise
// 		 allow people to pick seats

var ws = new WebSocket("ws://poker.mkassaian.com:8080");
var myName = localStorage.getItem("username").trim().substring(0, 15); // limit size of name to be 15 chars
var myBuyIn = localStorage.getItem("buyin").trim().substring(0, 7); // limit size of buyin to be 7 digits
ws.onopen=(e)=>ws.send(myBuyIn + "," + myName);
var interval = setInterval(()=>ws.send("1"), 1200); // server pings client w data every 1200 ms
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
//var prevTurn;
//var prevAction;
var veryFirst = true;
//var alreadyAnimated;
var prevActionIndex;
var prevActionMessage;


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
var actionMessage;
var actionIndex;

var dataArray;
ws.onmessage = function(event) {
	dataDict = JSON.parse(event.data);
	holeCards = dataDict["hole_cards"];
	riverHoleCards = dataDict["river_hole_cards"];
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
	actionMessage = dataDict["action_message"];
	actionIndex = dataDict["action_index"];

	if (!veryFirst) {
		// if the dealer position has moved, it is a new round
		if (dealer != dataDict["dealer"]) {
			newRound = true;
		} else {
			newRound = false;
		}

		// if there are a differing number of -1's between board cards, it is a new betting round
		/*if (countInArray(communityCards, -1) != countInArray(dataDict["board_cards"], -1)) {
			newBettingRound = true;
		} else {
			newBettingRound = false;
		} */
	}

	// this has to be after the new round check!!
	dealer = dataDict["dealer"];

	// this has to be after the new betting round check!!
	communityCards = dataDict["board_cards"];

	// set myIndex, should only have to do once
	myIndex = playerNames[myName];

	// reset inPlayers and hide fold message at the start of each new round 
	if (newRound && numPlayers >= 2) {
		inPlayers = [];
		for (i = 0; i < numPlayers; i++) {
			inPlayers.push(i);
		}
		resetGame();
		document.getElementById("fold-message").style.visibility = "hidden";
		prevActionIndex = -1;
		prevActionMessage = "";
		actionIndex = -1;
		actionMessage = "";
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
	if ((actionIndex !== -1) && (actionMessage !== "") && (actionIndex !== prevActionIndex) && (actionMessage !== prevActionMessage)) {
		window.alert("inside that if statement");
		animateAction(actionIndex, actionMessage);
		prevActionIndex = actionIndex;
		prevActionMessage = actionMessage;
	}
	/*
	var nextPersonsTurn = (prevTurn != (currPlayerTurn - 1 + numPlayers) % numPlayers);
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
	} else {
		prevAction = false;
	} 
	if (!veryFirst && (nextPersonsTurn) && alreadyAnimated != prevTurn) {
		animateAction(prevTurn, prevAction);
		nextPersonsTurn = false;
		alreadyAnimated = prevTurn;		
	}
	prevTurn = (currPlayerTurn - 1 + numPlayers) % numPlayers;

	*/
	updateVariables();
	if (riverHoleCards.length > 1 && inPlayers.length != 0) {
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

function updateCards(cardID, fileName, playingCard = true) {
	var x = document.getElementById(cardID);
	if (playingCard) {
		x.setAttribute("src", "../images/cards/" + fileName.toUpperCase() + ".png");
	} else {
		x.setAttribute("src", "../images/cards/" + fileName + ".png");
	}
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
		updateCards("flop1", "blue_back", false);
		document.getElementById("flop1").style.visibility = "hidden";
	}
	if (flop2 != -1) {
		updateCards("flop2", flop2);
		document.getElementById("flop2").style.visibility = "visible";
	} else {
		updateCards("flop2", "blue_back", false);
		document.getElementById("flop2").style.visibility = "hidden";
	}
	if (flop3 != -1) {
		updateCards("flop3", flop3);
		document.getElementById("flop3").style.visibility = "visible";
	} else {
		updateCards("flop3", "blue_back", false);
		document.getElementById("flop3").style.visibility = "hidden";
	}
	if (turn1 != -1) {
		updateCards("turn1", turn1);
		document.getElementById("turn1").style.visibility = "visible";
	} else {
		updateCards("turn1", "blue_back", false);
		document.getElementById("turn1").style.visibility = "hidden";
	}
	if (river1 != -1) {
		updateCards("river1", river1);
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
	for (i = 0; i < numPlayers; i++) {
		if (i != currPlayerTurn) {
			document.getElementById("p" + i.toString()).style.backgroundColor = "rgba(150, 150, 150, .8)";

		} else {
			document.getElementById("p" + i.toString()).style.backgroundColor = "deepskyblue";

		}
	}
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

/* function hideUserInput () {
	var toHide = document.getElementById("user-input").getElementsByClassName("toggle-visibility")[0];
	toHide.style.visibility = 'hidden';
	no idea if this works 
} */

/* function showUserInput () {
	var toShow = document.getElementById("user-input").getElementsByClassName("toggle-visibility")[0];
	toShow.style.visibility = 'visible';
	no idea if this works
} */

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
	// p sure this works
}

function updateBetsAndFolds() {
	var removed = 0;
	for (i = 0; i < numPlayers; i++) {
		if (bets[i] == -1) { // fold
			inPlayers.splice(i - removed, 1);
			removed++;
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
		if (folded[i] == 1) {
			document.getElementById("first-p" + i.toString()).style.visibility = "hidden";
			document.getElementById("second-p" + i.toString()).style.visibility = "hidden";
		} else {
			document.getElementById("first-p" + i.toString()).style.visibility = "visible";
			document.getElementById("second-p" + i.toString()).style.visibility = "visible";
		}
	} // not sure if this correctly removes players from inPlayers but fairly confident
}

function showHoleCardsAtEnd() {
	for (i = 0; i < numPlayers.length; i++) {
		if (inPlayers.includes(i)) {
			updateCards("first-p" + i.toString(), riverHoleCards[i][0]);
			updateCards("second-p" + i.toString(), riverHoleCards[i][1]);
		}
	}
}

function animateAction(playerID, message) {
	window.alert("in animateAction");
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
	// data in form of: "0,*integer corresponding to bet/check*,*action message for animations*,*myIndex*)
	var data;
	if (arg == "raise") {
		var raiseAmount = document.getElementById("raise-amount").value;
		data = "0," + raiseAmount.toString()  + ",Raise to " + raiseAmount.toString() + "," + myIndex.toString();
	}
	if (arg == "check/call") {
		var maxBet = Math.max.apply(null, bets);
		if (maxBet > stacks[myIndex] + bets[myIndex]) {
			data = "0," + (stacks[myIndex] + bets[myIndex]).toString() + ",All in for " + (stacks[myIndex] + bets[myIndex]).toString() + "," + myIndex.toString();;
		} else {
			data = "0," + maxBet.toString() + ",Call " + maxBet.toString() + "," + myIndex.toString();
		}
	}
	if (arg == "allin") {
		var allInAmount = stacks[myIndex] + bets[myIndex];
		data = "0," + allInAmount.toString() + ",All in for " + allInAmount.toString() + "," + myIndex.toString();
	} else if (arg == "leave") {
		data = "";
	} else if (arg == -1) {
		data = "0,-1," + "Fold," + myIndex.toString();
	} else if (typeof arg === "number") {
		data = "0," + arg.toString() + ",Bet " + arg.toString() + "," + myIndex.toString();
	}
	document.getElementById("raise-amount").value = ""; // clear raise input field
	ws.send(data);
}
