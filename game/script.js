// TODO: fold pile
// 		 display check/fold/raise etc text when people make those actions. DONE
//		 display small/big blinds
//		 auto check/auto fold
//		 clock animation
//		 straddle, left, right (show cards) = toggle
//		 leave game = close the tab
//		 fold message doesn't work
// 		 allow people to pick seats
// 		 display winner of the hand
//		 add sound to signal your turn/moving chips around/when you check
// 		 properly discard of kicked players
//		 check for legitimate min raise
//		 can see other players previous hole cards...fix

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
var newRound = true;
var veryFirst = true;
var prevHand = -1;


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
var actions;
var handNumber;
var winners;
var winnings;
var sidePots;
var inPlayers;


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
	handNumber = dataDict["hand_number"];
	dealer = dataDict["dealer"];
	communityCards = dataDict["board_cards"];
	actions = dataDict["actions"];
	winners = dataDict["winners"];
	winnings = dataDict["final_winnings"];
	sidePots = dataDict["side_pots"];
	inPlayers = dataDict["player_order"];

	// set myIndex, should only have to do once
	myIndex = playerNames[myName];

	if (handNumber != prevHand) {
		newRound = true;
		prevHand = handNumber;
	} else {
		newRound = false;
	}

	// update playerspaces (make visible if the player exists)
	for (i = 0; i < numPlayers; i++) {
		if (folded[i] == 0) { // show if not folded
			document.getElementById("p" + i.toString()).getElementsByClassName("toggle-visibility")[0].style.visibility = "visible";
		}
	}
	updateVariables();
	// unnecesssary check, but why not
	if (actions.length != 0) {
		animations(actions);
	}
	
	if (riverHoleCards.length > 1 && inPlayers.length != 0) { 
		showHoleCardsAtEnd();
		winnersMessage();
	}

	// reset inPlayers and hide fold message at the start of each new round 
	if (newRound) {
		/* if (numPlayers >= 2) {
			inPlayers = [];
			for (i = 0; i < numPlayers; i++) {
				inPlayers.push(i);
			}
		} else {
			inPlayers = [0, 1];
		} */
		resetGame();
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
	for (i = 0; i < 9; i++) {
		document.getElementById("p" + i.toString()).getElementsByClassName("toggle-visibility")[0].style.visibility = "hidden";
	}
}

function resetGame() {
	/* for (i = 0; i < numPlayers; i++) {
		alert("resetting player " + i.toString());
		updateCards("first-p" + i.toString(), "blue_back", false);
		updateCards("second-p" + i.toString(), "blue_back", false);
	} */
	var everyoneFirst = document.getElementsByClassName("first");
	var everyoneSecond = document.getElementsByClassName("second");
	for (i = 0; i < everyoneFirst.length; i++) {
		everyoneFirst[i].setAttribute("src", "../images/cards/blue_back.png");
	}
	for (i = 0; i < everyoneSecond.length; i++) {
		everyoneSecond[i].setAttribute("src", "../images/cards/blue_back.png");
	}
	updateCards("first-card", "blue_back", false);
	updateCards("second-card", "blue_back", false); 
	document.getElementById("winner-message").innerHTML = "";
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
	// p sure this works
}

function updateBetsAndFolds() {
	var removed = 0;
	for (i = 0; i < numPlayers; i++) {
		if (bets[i] == -1) { // fold
			inPlayers.splice(i - removed, 1);
			removed++;
		} else { // check or call or raise
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
	for (i = 0; i < numPlayers; i++) {
		if (inPlayers.includes(i)) {
			updateCards("first-p" + i.toString(), riverHoleCards[i][0]);
			updateCards("second-p" + i.toString(), riverHoleCards[i][1]);
		}
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
	// i dont actually use this anymore :(
}

function animations(actionList) {
	for (i = 0; i < actionList.length; i++) {
		var sender = parseMessage(actionList[i])[0];
		var actualMessage = parseMessage(actionList[i])[1];
		beginAnimation(sender, actualMessage);
	}
	setTimeout(function() {
		for (i = 0; i < actionList.length; i++) {
			var sender = parseMessage(actionList[i])[0];
			endAnimation(sender);
		}
	}, 1000);
}

function parseMessage(message) {
	var returnList = [];
	returnList[0] = message.substring(0, 1);
	returnList[1] = message.substring(1);
	return returnList;
}

function beginAnimation(playerID, message) {
	var player = document.getElementById("action-text-p" + playerID.toString());
	player.querySelector(".action-text p").innerHTML = message;
	player.classList.add("action-text-transition");
}

function endAnimation(playerID) {
	var player = document.getElementById("action-text-p" + playerID.toString());
	player.classList.remove("action-text-transition");
}

function changeRaise(scalar) {
	var raiseSize = scalar * pot;
	document.getElementById("raise-amount").value = Math.floor(raiseSize).toString();
	// very confident this works, just need to clear after your turn is over
}

function updatePot() {
	document.getElementById("pot-display").querySelector("h5").innerHTML = "Pot: " + pot.toString();
}

function winnersMessage() {
	var message = "";
	if (winners.length == 1 && winnings.length == 1) {
		message = winners[0] + " wins the pot of " + winnings[0].toString();
	} else {
		for (i = 0; i < winners.length; i++) {
			if (i == winners.length -1) {
				message += winners[i] + " wins " + winnings[i].toString();
			} else {
				message += winners[i] + " wins " + winnings[i].toString() + ", ";
			}
		}
	}
	document.getElementById("winner-message").innerHTML = message;
}

function send(arg) {
	// data in form of: "0,*integer corresponding to bet/check*,*myIndex + action message for animations*)
	var maxBet = Math.max.apply(null, bets);
	bets.splice(bets.indexOf(maxBet), 1);
	var secondHighestBet = Math.max.apply(null, bets);
	var data;
	if (arg == "raise") {
		var raiseAmount = document.getElementById("raise-amount").value;
		if (raiseAmount < 2 * maxBet - secondHighestBet) {
			data = "0," + raiseAmount.toString()  + "," +  myIndex.toString() + "Tried to make an invalid bet";
		} else {
			data = "0," + raiseAmount.toString()  + "," +  myIndex.toString() + "Raise to " + raiseAmount.toString();
		}
	}
	if (arg == "check/call") {
		if (maxBet > stacks[myIndex] + bets[myIndex]) { // max bet is more than my stack + current bet
			data = "0," + (stacks[myIndex] + bets[myIndex]).toString() + "," + myIndex.toString() + "All in for " + (stacks[myIndex] + bets[myIndex]).toString();
		} else if (maxBet == 0 || maxBet == bets[myIndex]) { // if the max bet is 0 or if my current bet is the max bet, i can check
			data = "0," + maxBet.toString() + "," + myIndex.toString() + "Check"; 
		} else { // it is a normal call otherwise
			data = "0," + maxBet.toString() + "," + myIndex.toString() + "Call " + (maxBet - bets[myIndex]).toString();
		}
	}
	if (arg == "allin") {
		window.alert("allin");
		var allInAmount = stacks[myIndex] + bets[myIndex];
		data = "0," + allInAmount.toString() + "," + myIndex.toString() + "All in for " + allInAmount.toString();
	} else if (arg == "leave") {
		data = "";
	} else if (arg == -1) {
		data = "0,-1," + myIndex.toString() + "Fold";
	} else if (typeof arg === "number") {
		data = "0," + arg.toString() + "," + myIndex.toString() + "Bet " + arg.toString();
	}
	document.getElementById("raise-amount").value = ""; // clear raise input field
	ws.send(data);
}
