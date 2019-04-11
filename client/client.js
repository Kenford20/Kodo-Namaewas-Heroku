window.onload=function(){
	const host = window.location.origin; 
	const socket = io.connect(host);

/*
	Global variables
*/
const joinBlue_btn    = document.querySelector("#blue-join-btn");
const joinRed_btn     = document.querySelector("#red-join-btn");
const redSpy_btn      = document.querySelector("#red-spy");
const blueSpy_btn     = document.querySelector("#blue-spy");
const startGame_btn   = document.querySelector("#start-game");
const restartGame_btn = document.querySelector("#restart-game");
const submitName_btn  = document.querySelector("#name-btn");

const hintInput      = document.querySelector("#hint-input-container");
const nameInput      = document.querySelector("#name-input");
const chat           = document.querySelector("#chat");
const chatInput      = document.querySelector("#chat-input");
const teamChatInput  = document.querySelector("#team-chat-input");
const chatBox        = document.querySelector("#global-message-box");
const teamChatBox    = document.querySelector("#team-message-box");
const gameBoard      = document.querySelector("#game-board");
const allCards       = document.querySelectorAll(".card");

const blueWaitingMessage = document.querySelector("#blue-waiting");
const redWaitingMessage  = document.querySelector("#red-waiting");
const blueGuessMessage   = document.querySelector("#blue-guess");
const redGuessMessage    = document.querySelector("#red-guess");
const resetMessage       = document.querySelector("#reset-message");

const spectatorList  = document.querySelector("#players");
const bluePlayerList = document.querySelector("#blue-players");
const redPlayerList  = document.querySelector("#red-players");

const client = {
	name: '',
	team: '',
	isSpymaster: false,
	yourTurn: false,
	teamJoinCounter: 0,
	isOnATeam: false,
	canGuess: false
};

let gameisNotStarted = true;
let bothSpiesExist = false;

/* 
	MODULE IMPORTS
*/
const hideShowHandlers = require('./functions/update/hide-show-handlers');
let HIDE_ELEMENTS = hideShowHandlers.hideElements;
let SHOW_ELEMENTS = hideShowHandlers.showElements;


/***************************************************************
******************* PLAYER SET UP BELOW ************************
****************************************************************/

/* 
	PLAYER NAME SET UP
*/
const nameHandlers = require('./functions/player-setup/name-handlers');
let SEND_NAME_TO_SERVER = nameHandlers.sendNameToServer;
let APPEND_TO_DOM       = nameHandlers.appendToDOM;
let REMOVE_FROM_DOM     = nameHandlers.removeFromDOM;
let UPDATE_PLAYER_LISTS = nameHandlers.updatePlayerLists;

const teamHandlers = require('./functions/team-setup/team-handlers');
let HANDLE_JOIN_TEAM = teamHandlers.handleJoinTeam;

const updateHandlers = require('./functions/update/update-handlers');
let UPDATE_CURRENT_PLAYERS = updateHandlers.updateCurrentPlayers;
let UPDATE_BOARD           = updateHandlers.updateBoard;
let UPDATE_GAME_WORDS      = updateHandlers.updateGameWords;

/* PLAYER SET UP HTML LISTENERS */
submitName_btn.addEventListener("click", () => {
	SEND_NAME_TO_SERVER(socket, 'newPlayerJoined', nameInput.value);
	client.name = nameInput.value;
	HIDE_ELEMENTS(submitName_btn, nameInput);
});

joinBlue_btn.addEventListener("click", () => {
	if(client.team != 'blue' && client.name != '') {
		HANDLE_JOIN_TEAM(socket, gameisNotStarted, 'blue', client);
	}
});

joinRed_btn.addEventListener("click", () => {
	if(client.team != 'red' && client.name != '') {
		HANDLE_JOIN_TEAM(socket, gameisNotStarted, 'red', client);
	}
});

/* PLAYER SET UP SOCKET LISTENERS */
socket.on('add new player', (spectatorName) => APPEND_TO_DOM(spectatorName, spectatorList));
socket.on('add blue player', (bluePlayerName) => APPEND_TO_DOM(bluePlayerName, bluePlayerList));
socket.on('add red player', (redPlayerName) => APPEND_TO_DOM(redPlayerName, redPlayerList));

socket.on('removeSpectator', (spectator) => UPDATE_PLAYER_LISTS(socket, spectator, spectatorList, client));
socket.on('spectatorLeft', (spectator)   => UPDATE_PLAYER_LISTS(socket, spectator, spectatorList, client));
socket.on('bluePlayerLeft', (bluePlayer) => REMOVE_FROM_DOM(bluePlayer, bluePlayerList));
socket.on('redPlayerLeft', (redPlayer)   => REMOVE_FROM_DOM(redPlayer, redPlayerList));
socket.on('bothSpiesExist', (doBothSpiesExist) => bothSpiesExist = doBothSpiesExist);

socket.on('update players for new connection', ({ spectators, bluePlayers, redPlayers }) => {
	UPDATE_CURRENT_PLAYERS(spectators, spectatorList);
	UPDATE_CURRENT_PLAYERS(bluePlayers, bluePlayerList);
	UPDATE_CURRENT_PLAYERS(redPlayers,  redPlayerList);
});

/* 
	SPYMASTER SET UP
*/
const spyHandlers = require('./functions/spymaster-setup/spy-handlers');
let SEND_SPY_TO_SERVER  = spyHandlers.sendSpyToServer;
let HIGHLIGHT_SPYMASTER = spyHandlers.highlightSpymaster;
let REMOVE_SPY_BUTTON   = spyHandlers.removeSpyButton;
let SHOW_SPY_BUTTON     = spyHandlers.showSpyButton;

/* SPYMASTER HTML LISTENERS */
blueSpy_btn.addEventListener("click", () => SEND_SPY_TO_SERVER(socket, client));
redSpy_btn.addEventListener("click",  () => SEND_SPY_TO_SERVER(socket, client));

/* SPYMASTER SOCKET LISTENERS */
socket.on('someoneBecameBlueSpy', ({ blueSpyMaster, blueSpyExists }) => {
	REMOVE_SPY_BUTTON(socket, blueSpyMaster, blueSpyExists, 'blue');
});

socket.on('someoneBecameRedSpy', ({ redSpyMaster, redSpyExists }) => {
	REMOVE_SPY_BUTTON(socket, redSpyMaster, redSpyExists, 'red');
});

socket.on('update blue spymaster for new connection', ({ blueSpyMaster, blueSpyExists }) => {
	REMOVE_SPY_BUTTON(socket, blueSpyMaster, blueSpyExists, 'blue');
});

socket.on('update red spymaster for new connection', ({ redSpyMaster, redSpyExists }) => {
	REMOVE_SPY_BUTTON(socket, redSpyMaster, redSpyExists, 'red');
});

socket.on('blueSpyLeft',        () => SHOW_SPY_BUTTON(client, 'blue'));
socket.on('blueSpyChangedTeam', () => SHOW_SPY_BUTTON(client, 'blue'));
socket.on('redSpyLeft',         () => SHOW_SPY_BUTTON(client, 'red'));
socket.on('redSpyChangedTeam',  () => SHOW_SPY_BUTTON(client, 'red'));
socket.on('highlightBlueSpy', (nameOfSpy) => HIGHLIGHT_SPYMASTER(nameOfSpy, bluePlayerList, 'blue'));
socket.on('highlightRedSpy',  (nameOfSpy) => HIGHLIGHT_SPYMASTER(nameOfSpy, redPlayerList, 'red'));

/*
	CHAT
*/
const chatHandlers = require('./functions/chat/chat-handlers');
let CHAT_ENTERED           = chatHandlers.chatEntered;
let TEAM_CHAT_ENTERED      = chatHandlers.teamChatEntered;
let DISPLAY_CHAT_MESSAGE   = chatHandlers.displayChatMessage;
let HIGHLIGHT_CHATTER      = chatHandlers.highlightChatter;

/* CHAT HTML LISTENERS */
chatInput.addEventListener("keyup",     () => CHAT_ENTERED(socket, client));
teamChatInput.addEventListener("keyup", () => TEAM_CHAT_ENTERED(socket, client));

/* CHAT SOCKET LISTENERS */
socket.on('displayChatMessage', ({ chatter, chatMessage, isTeamMessage }) => {
	DISPLAY_CHAT_MESSAGE(socket, chatter, chatMessage, isTeamMessage);
});

socket.on('displayTeamChat', ({ chatter, chatMessage, isTeamMessage }) => {
	DISPLAY_CHAT_MESSAGE(socket, chatter, chatMessage, isTeamMessage);
});

socket.on('showClientChatter', () => HIGHLIGHT_CHATTER(client));

/***************************************************************
************ GAME HAS NOW STARTED BELOW ************************
****************************************************************/

/*
	INITIAL GAME SET UP
*/
const gameSetupHandlers = require('./functions/game-setup/game-setup-handlers');
let SET_STARTING_BOARD   = gameSetupHandlers.setStartingBoard;
let SHOW_SCORES          = gameSetupHandlers.showScores;
let SET_GAME_WORDS       = gameSetupHandlers.setGameWords;
let SET_SPY_BOARD_COLORS = gameSetupHandlers.setSpyBoardColors;
let CREATE_HINT_BOX      = gameSetupHandlers.createHintBox;

/* GAME SETUP HTML LISTENERS */
document.querySelector("#hint-btn").addEventListener("click", startGuess);
restartGame_btn.addEventListener("click", restartGame);
startGame_btn.addEventListener("click", () => {
	SET_STARTING_BOARD(socket, bothSpiesExist, gameisNotStarted);
});

for(let i = 0; i < allCards.length; i++) {
	allCards[i].addEventListener("click", whichCardWasPicked);
}

/* GAME SETUP SOCKET LISTENERS */
socket.on('gameHasStarted', () => gameisNotStarted = false);
socket.on('showScores',         (gameData) => SHOW_SCORES(gameData));
socket.on('setUpGameWords',   (boardWords) => SET_GAME_WORDS(boardWords));
socket.on('youCanSeeTheBoard', (boardData) => SET_SPY_BOARD_COLORS(boardData));
socket.on('createHintBox',      (gameData) => CREATE_HINT_BOX(gameData));

/* 
	GAME PLAY 
*/
const gameplayHandlers = require('./functions/game-setup/game-play-handlers');
let UPDATE_SCORES = gameplayHandlers.updateScores;

socket.on('waitingForBlueSpy', blueTeamWaits);
socket.on('waitingForRedSpy', redTeamWaits);
socket.on('guessMessage', guessMessage);
socket.on('revealHint', revealHint);
socket.on('pickCards', pickCards);
socket.on('showGuesser', showGuesser);
socket.on('updateScore', (gameData) => UPDATE_SCORES(gameData));
socket.on('revealCardColor', revealCardColor);
socket.on('guessHasBeenMade', revealCardForSpies);
socket.on('donePickingCards', disableEventListeners);

function blueTeamWaits({ gameOver }){
	if(!gameOver){
		HIDE_ELEMENTS(
			redWaitingMessage, 
			redGuessMessage, 
			resetMessage, 
			document.querySelector("#hint-message"), 
			document.querySelector("#message")
		);
		SHOW_ELEMENTS(blueWaitingMessage);
	}
}

function redTeamWaits({ gameOver }){
	if(!gameOver){
		HIDE_ELEMENTS(
			blueWaitingMessage,
			blueGuessMessage,
			resetMessage,
			document.querySelector("#hint-message"), 
			document.querySelector("#message")
		);
		SHOW_ELEMENTS(redWaitingMessage);
	}
}

// runs when hint submission button is clicked
// hides the hint input from the spy master once the hint is submitted
function startGuess(){
	socket.emit('guessMessage');

	const hintData = {
		word: '',
		number: 0,
		isBlueTurn: false,
		isRedTurn: false
	};

	hintData.word = document.querySelector("#input-hint").value;
	hintData.number = document.querySelector("select").value;
	socket.emit('hintSubmitted', hintData);

	HIDE_ELEMENTS(hintInput)

	let select = document.querySelector("select");
	select.parentNode.removeChild(select);

	socket.emit('readyToGuess');
}

// reveals a message to all clients prompting them to guess
function guessMessage({ isBlueTurn }){
	HIDE_ELEMENTS(resetMessage);
	if(isBlueTurn){
		HIDE_ELEMENTS(blueWaitingMessage);
		SHOW_ELEMENTS(blueGuessMessage);
	}
	else{
		HIDE_ELEMENTS(redWaitingMessage);
		SHOW_ELEMENTS(redGuessMessage);
	}
}

// reveals the hint to all clients, showing the word and number
function revealHint(hintData){
	SHOW_ELEMENTS(document.querySelector("#hint-message"));
	document.querySelector("#hint-word").innerHTML = hintData.word;
	document.querySelector("#hint-number").innerHTML = hintData.number;

	// styling the hint spans
	if(hintData.isBlueTurn){
		document.querySelector("#hint-word").style.color = "#1c64ff";
		document.querySelector("#hint-number").style.color = "#1c64ff";
	}
	else{
		document.querySelector("#hint-word").style.color = "#db3328";
		document.querySelector("#hint-number").style.color = "#db3328";
	}
}

// boolean controlled by the server (will only run for clients when it is their turn to guess)
function pickCards(){
	client.canGuess = true;
}

// determines which card was selected based on the index in the array of cards
function whichCardWasPicked(){
	const { canGuess, name } = client;
	if(canGuess){ 
		// allCards is a nodeList created from querySelectorAll
		// the assignment below turns it into an array to allow for use of array methods
		let allCardsArray = [].slice.call(allCards);
		socket.emit('cardWasPicked', allCardsArray.indexOf(this));
		socket.emit('showGuesser', name);
	} else {
		alert('It is not your turn! Please wait until next round to guess!');
	}
}

// reveals the div that shows who guessed the lastly guessed word
function showGuesser({ isBlueTurn, isRedTurn, cardSelected, playerWhoGuessed }){
	if(isBlueTurn){
		document.querySelector("#blue-guess-name").innerHTML = playerWhoGuessed;
		let wordPicked = allCards[cardSelected].querySelector("p").innerHTML
		document.querySelector("#blue-guess-word").innerHTML = wordPicked;
		SHOW_ELEMENTS(document.querySelector("#blue-guesser"));
	}
	else if(isRedTurn){
		document.querySelector("#red-guess-name").innerHTML = playerWhoGuessed;
		let wordPicked = allCards[cardSelected].querySelector("p").innerHTML
		document.querySelector("#red-guess-word").innerHTML = wordPicked;
		SHOW_ELEMENTS(document.querySelector("#red-guesser"));
	}
}

// just changes styles for spies when a card is selected so they know what the guesses are
function revealCardForSpies({ cardSelected, gameBoardColors }){
	let word = allCards[cardSelected].querySelector("p");
	word.style.textDecoration = "line-through";
	allCards[cardSelected].classList.remove('rotate');

	if(gameBoardColors[cardSelected] == 'blue'){
		allCards[cardSelected].classList.remove('blue');
		allCards[cardSelected].classList.add('blue2');
	}
	else if(gameBoardColors[cardSelected] == 'red'){
		allCards[cardSelected].classList.remove('red');
		allCards[cardSelected].classList.add('red2');
	}
	else if(gameBoardColors[cardSelected] == 'yellow'){
		allCards[cardSelected].classList.remove('yellow');
		allCards[cardSelected].classList.add('yellow2');		
	}
	else{
		allCards[cardSelected].classList.remove('black');
		allCards[cardSelected].classList.add('black2');
	}
	allCards[cardSelected].classList.add('rotate');
}

// receives the selected card from above and reveals its true color from the game board
// turn ends when the number of selected cards match the number given in the hint
// turn also ends when a yellow or a card from the opposite team is selected
function revealCardColor({ cardSelected, gameBoardColors, numCardsPicked, numCardsToGuess, isBlueTurn, isRedTurn }){	
	allCards[cardSelected].classList.remove("default");
	allCards[cardSelected].classList.add(gameBoardColors[cardSelected]);
	allCards[cardSelected].classList.remove('rotate');
	socket.emit('updateCardCount', gameBoardColors[cardSelected]);

	if(numCardsPicked < numCardsToGuess){
		if((isBlueTurn && gameBoardColors[cardSelected] == 'red') ||
		   (isRedTurn && gameBoardColors[cardSelected] == 'blue') ||
		   gameBoardColors[cardSelected] == 'yellow'){
				socket.emit('endTurn');
		}
		if(gameBoardColors[cardSelected] == 'black')
			socket.emit('blackCard');
	}
	else{
		if(gameBoardColors[cardSelected] == 'black')
			socket.emit('blackCard');
		else{
			socket.emit('updateCardCount', gameBoardColors[cardSelected]);
			socket.emit('endTurn');
		}
	}
	allCards[cardSelected].classList.add('rotate');
}

// players aren't allowed to guess/select cards during the hinting phase 
function disableEventListeners(){
	client.canGuess = false;
}

function blueWins(){
	document.querySelector("#congrats").classList.add("blue-word");
	SHOW_ELEMENTS(
		document.querySelector("#blue-wins"),
		document.querySelector("#congrats")
	);
	HIDE_ELEMENTS(
		document.querySelector("#hint-message"),
		blueWaitingMessage,
		redWaitingMessage,
		blueGuessMessage,
		redGuessMessage
	);
}

function redWins(){
	document.querySelector("#congrats").classList.add("red-word");
	SHOW_ELEMENTS(
		document.querySelector("#red-wins"),
		document.querySelector("#congrats")
	);
	HIDE_ELEMENTS(
		document.querySelector("#hint-message"),
		blueWaitingMessage,
		redWaitingMessage,
		blueGuessMessage,
		redGuessMessage
	);
}

/* Restarting the game */
function restartGame(){
	socket.emit('restartGame');
}

// removes all the classes from the card divs to reset the board
function newBoard({ currentBoardColors }){
	for(let i = 0; i < currentBoardColors.length; i++){
		allCards[i].classList.remove("red");
		allCards[i].classList.remove("blue");
		allCards[i].classList.remove("yellow");
		allCards[i].classList.remove("black");
	}
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

function resetSpyBoard(){
	if(!gameisNotStarted) {
		for(let i = 0; i < allCards.length; i++){
			allCards[i].classList.remove("red2");
			allCards[i].classList.remove("blue2");
			allCards[i].classList.remove("yellow2");
			allCards[i].classList.remove("black2");

			let word = allCards[i].querySelector("p");
		}
		HIDE_ELEMENTS(hintInput);

		let select = document.querySelector("select");
		select.parentNode.removeChild(select);
	}
}

// [].slice.call converts the nodelist returned from querySelectorAll into an array
function resetChat(){
	let allGlobalMessages = [].slice.call(chatBox.querySelectorAll("h5"));
	let allTeamMessages = [].slice.call(teamChatBox.querySelectorAll("h5"));

	allGlobalMessages.map(message => chatBox.removeChild(message));
	allTeamMessages.map(message => teamChatBox.removeChild(message));
}

function resetWords(){
	let gameWords = [].slice.call(gameBoard.querySelectorAll("a"));
	gameWords.map((word, index) => word.innerHTML = 'Word' + (index + 1));	
}

function removePlayers({ allPlayers }){
	// reset all client data
	client.team = '';
	client.isSpymaster = false;
	client.yourTurn = false;
	client.teamJoinCounter = 0;
	client.isOnATeam = false;
	client.canGuess = false;

	gameisNotStarted = true;
	bothSpiesExist = false;

	// remove all the player names from the client's browser
	for(let i = 0; i < allPlayers.length; i++){
		removeSpectator(allPlayers[i]);
		removeBluePlayer(allPlayers[i]);
		removeRedPlayer(allPlayers[i]);
	}

	// reset all buttons and messages
	SHOW_ELEMENTS(
		blueSpy_btn,
		redSpy_btn,
		submitName_btn,
		nameInput,
		resetMessage,
		document.querySelector("#message")
	);
	HIDE_ELEMENTS(
		document.querySelector("#blue-spy-message"),
		document.querySelector("#red-spy-message"),
		document.querySelector("#blue-wins"),
		document.querySelector("#red-wins"),
		document.querySelector("#congrats"),
		document.querySelector("#hint-message"),
		document.querySelector("#blue-guesser"),
		document.querySelector("#red-guesser"),
		document.querySelector("#chat"),
		document.querySelector("#message"),
		document.querySelector("#blue-score"),
		document.querySelector("#red-score"),
		blueWaitingMessage,
		redWaitingMessage,
		blueGuessMessage,
		redGuessMessage
	);
	// reset team chat border color
	document.querySelector("#team-chat-div").classList.add("chat-black");
	document.querySelector("#team-chat-div").classList.remove("team-chat-blue");
	document.querySelector("#team-chat-div").classList.remove("team-chat-red");
}

/* Sockets
**************************************/

socket.on('updateBoard', updateBoard);
socket.on('updateGameWords', updateGameWords);

// game started
socket.on('blueWins', blueWins);
socket.on('redWins', redWins);
socket.on('restartingGame', removePlayers);
socket.on('resetSpyBoard', resetSpyBoard);
socket.on('resetTheChat', resetChat);
socket.on('resetWords', resetWords);
socket.on('newBoard', newBoard);
}