

function goToGame() {
	localStorage.setItem("username", document.getElementById("username").value);
	localStorage.setItem("buyIn", document.getElementById("buy-in").value);
	document.location.href ='game/index.html';

}

function store() {
	var inputName = document.getElementById("name");
	localStorage.setItem("name", inputName.value);
}