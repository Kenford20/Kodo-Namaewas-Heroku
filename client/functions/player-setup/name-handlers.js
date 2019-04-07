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
	console.log(playerList);
	[].slice.call(playerList.querySelectorAll("h3")).map(name => {
		if(name.innerHTML === playerName)
			playerList.removeChild(name); 
	})
}

module.exports = {
	sendNameToServer: sendNameToServer,
	appendToDOM: appendToDOM,
	removeFromDOM: removeFromDOM
}