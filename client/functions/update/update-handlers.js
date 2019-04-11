const allCards = document.querySelectorAll(".card");
const gameBoard = document.querySelector("#game-board");

function updateCurrentPlayers(playerNames, elementLocation) {
	playerNames.map(playerName => {
		let player = document.createElement("h3");
		let node = document.createTextNode(playerName);
		player.appendChild(node);
		elementLocation.appendChild(player);
	});
}

function updateBoard({ currentBoardColors }) {
	for(let i = 0; i < allCards.length; i++) {
		if(currentBoardColors[i] != 'lightgrey')
			allCards[i].classList.add(currentBoardColors[i]);
	}
}

function updateGameWords(gameData) {
	if(gameHasStarted){
		let gameWords = gameBoard.querySelectorAll("p");
		document.querySelector("#message").classList.add("hide");

		for(let i = 0; i < gameWords.length; i++) {
			gameWords[i].innerHTML = gameData.gameWords[i];
		}
	}
}

module.exports = {
    updateCurrentPlayers: updateCurrentPlayers,
    updateBoard: updateBoard,
    updateGameWords: updateGameWords
}