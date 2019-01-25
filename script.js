function goToGame() {
	var name = document.getElementById("username").value;
	var buyIn = document.getElementById("buy-in").value;
	localStorage.setItem("username", name);
	ws.send(name + " " + buyIn);
	document.location.href ='game/index.html';
}