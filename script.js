function goToGame() {
	document.getElementbyId("username").value = document.
}

function store() {
	var inputName = document.getElementById("name");
	localStorage.setItem("name", inputName.value);
}