function sendNameToServer(socket, socketMessage, playerName){
	console.log("sending name to server: " + playerName);
	socket.emit(socketMessage, playerName);
}

function appendToDOM(playerName, elementLocation) {
	let player = document.createElement("h3");
	let node = document.createTextNode(playerName);
	player.appendChild(node);
	elementLocation.appendChild(player);
}

function removeFromDOM(playerName, playerList) {
	[].slice.call(playerList.querySelectorAll("h3")).map(name => {
		if(name.innerHTML === playerName)
			playerList.removeChild(name); 
	})
}

function updatePlayerLists(socket, spectatorName, spectatorList, client) {
	removeFromDOM(spectatorName, spectatorList);

	// handles team changing of clients (you're switching teams if counter > 1)
	if(client.teamJoinCounter > 1 && client.name == spectatorName){
		if(client.team == "red")
			socket.emit('removeFromBlue', spectatorName);
		else if(client.team == "blue" && client.name == spectatorName)
			socket.emit('removeFromRed', spectatorName);
	}
	client.isOnATeam = true;
}

module.exports = {
	sendNameToServer: sendNameToServer,
	appendToDOM: appendToDOM,
	removeFromDOM: removeFromDOM,
	updatePlayerLists: updatePlayerLists
}