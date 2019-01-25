function goToGame() {
	var name = document.getElementById("username").value;
	var buyIn = document.getElementById("buy-in").value;
	localStorage.setItem("username", name); // store name in localStorage to be used in other HTMl file
	ws.send(name + " " + buyIn); // send name + _ + buy in amount to server
	document.location.href ='game/index.html'; // go to the game
}