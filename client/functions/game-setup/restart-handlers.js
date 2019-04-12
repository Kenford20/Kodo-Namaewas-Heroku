const redSpy_btn      = document.querySelector("#red-spy");
const blueSpy_btn     = document.querySelector("#blue-spy");
const submitName_btn  = document.querySelector("#name-btn");

const hintInput      = document.querySelector("#hint-input-container");
const nameInput      = document.querySelector("#name-input");
const chatBox        = document.querySelector("#global-message-box");
const teamChatBox    = document.querySelector("#team-message-box");
const gameBoard      = document.querySelector("#game-board");
const allCards       = document.querySelectorAll(".card");

const blueWaitingMessage = document.querySelector("#blue-waiting");
const redWaitingMessage  = document.querySelector("#red-waiting");
const blueGuessMessage   = document.querySelector("#blue-guess");
const redGuessMessage    = document.querySelector("#red-guess");
const resetMessage       = document.querySelector("#reset-message");

const hideShowHandlers = require('../update/hide-show-handlers');
let HIDE_ELEMENTS = hideShowHandlers.hideElements;
let SHOW_ELEMENTS = hideShowHandlers.showElements;

function restartGame(socket) {
	socket.emit('restartGame');
}

function resetDOMelements(client) {
	// reset all client data
	client.team = '';
	client.isSpymaster = false;
	client.yourTurn = false;
	client.teamJoinCounter = 0;
	client.isOnATeam = false;
	client.canGuess = false;

	// reset all buttons and messages
	SHOW_ELEMENTS(
		blueSpy_btn,
		redSpy_btn,
		submitName_btn,
		nameInput,
		resetMessage,
		document.querySelector("#message"),
		document.querySelector("#blue-spy-message"),
		document.querySelector("#red-spy-message"),
		document.querySelector("#blue-spy-waiting"),
		document.querySelector("#red-spy-waiting")
	);
	HIDE_ELEMENTS(
		document.querySelector("#reveal-blue-spy"),
		document.querySelector("#reveal-red-spy"),
		document.querySelector("#blue-wins"),
		document.querySelector("#red-wins"),
		document.querySelector("#congrats"),
		document.querySelector("#hint-message"),
		document.querySelector("#chat"),
		document.querySelector("#message"),
		blueWaitingMessage,
		redWaitingMessage,
		blueGuessMessage,
		redGuessMessage
	);
	document.querySelector("#blue-score").style.display = 'none';
	document.querySelector("#red-score").style.display = 'none';

	// reset team chat border color
	document.querySelector("#team-chat-div").classList.add("chat-black");
	document.querySelector("#team-chat-div").classList.remove("team-chat-blue");
	document.querySelector("#team-chat-div").classList.remove("team-chat-red");
}

function generateNewBoard({ currentBoardColors }) { 
	for(let i = 0; i < currentBoardColors.length; i++){
		allCards[i].classList.remove("red", "red2");
		allCards[i].classList.remove("blue", "blue2");
		allCards[i].classList.remove("yellow", "yellow2");
		allCards[i].classList.remove("black", "black2");
    }
    
    let gameWords = [].slice.call(gameBoard.querySelectorAll("p"));
	gameWords.map((word, index) => word.innerHTML = 'Word' + (index + 1));	
}

function removeSpyInputs() {
	HIDE_ELEMENTS(hintInput);

	let select = document.querySelector("select");
	select.parentNode.removeChild(select);
}

function resetChat() {
	let allGlobalMessages = [].slice.call(chatBox.querySelectorAll("h5"));
	let allTeamMessages = [].slice.call(teamChatBox.querySelectorAll("h5"));

	allGlobalMessages.map(message => chatBox.removeChild(message));
	allTeamMessages.map(message => teamChatBox.removeChild(message));
}

module.exports = {
	restartGame: restartGame,
	resetDOMelements: resetDOMelements,
	generateNewBoard: generateNewBoard,
	removeSpyInputs: removeSpyInputs,
    resetChat: resetChat,
}