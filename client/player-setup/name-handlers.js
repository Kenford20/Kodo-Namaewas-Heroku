function appendToDOM(playerName, elementLocation) {
	let player = document.createElement("h3");
	let node = document.createTextNode(playerName + "  ");
	player.appendChild(node);
	elementLocation.appendChild(player);
}

function updateCurrentPlayers(playerNames, elementLocation) {
	playerNames.map(playerName => {
		let player = document.createElement("h3");
		let node = document.createTextNode(playerName + "  ");
		player.appendChild(node);
		elementLocation.appendChild(player);
	});
}

module.exports = {
	appendToDOM: appendToDOM,
	updateCurrentPlayers: updateCurrentPlayers
}