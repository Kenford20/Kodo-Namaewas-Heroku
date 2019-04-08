function updateCurrentPlayers(playerNames, elementLocation) {
	playerNames.map(playerName => {
		let player = document.createElement("h3");
		let node = document.createTextNode(playerName);
		player.appendChild(node);
		elementLocation.appendChild(player);
	});
}

function updateBoard(gameData){
	for(let i = 0; i < allCards.length; i++){
		if(gameData.currentBoardColors[i] != 'lightgrey')
			allCards[i].classList.add(gameData.currentBoardColors[i]);
	}
}

function updateGameWords(gameData){
	if(gameData.gameHasStarted){
		let gameWords = gameBoard.querySelectorAll("p");	
		for(let i = 0; i < gameWords.length; i++){
			gameWords[i].innerHTML = gameData.gameWords[i];
		}
		document.querySelector("#message").classList.add("hide");
	}
}

module.exports = {
    updateCurrentPlayers: updateCurrentPlayers,
    updateBoard: updateBoard,
    updateGameWords: updateGameWords
}