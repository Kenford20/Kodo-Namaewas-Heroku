window.onload = function() {
	const host = window.location.origin; 
	const socket = io.connect(host);

	/* Global variables */
	const joinBlue_btn    = document.querySelector("#blue-join-btn");
	const joinRed_btn     = document.querySelector("#red-join-btn");
	const redSpy_btn      = document.querySelector("#red-spy");
	const blueSpy_btn     = document.querySelector("#blue-spy");
	const startGame_btn   = document.querySelector("#start-game");
	const restartGame_btn = document.querySelector("#restart-game");
	const submitName_btn  = document.querySelector("#name-btn");

	const nameInput      = document.querySelector("#name-input");
	const chatInput      = document.querySelector("#chat-input");
	const teamChatInput  = document.querySelector("#team-chat-input");
	const allCards       = document.querySelectorAll(".card");

	const spectatorList  = document.querySelector("#players");
	const bluePlayerList = document.querySelector("#blue-players");
	const redPlayerList  = document.querySelector("#red-players");
	
	let gameisNotStarted = true;
	let bothSpiesExist = false;

	const client = {
		name: '',
		team: '',
		isSpymaster: false,
		yourTurn: false,
		teamJoinCounter: 0,
		isOnATeam: false,
		canGuess: false
	};
	
	
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

	/* PLAYER SET UP HTML LISTENERS */
	submitName_btn.addEventListener("click", () => {
		let HIDE_ELEMENTS = require('./functions/update/hide-show-handlers').hideElements;
		
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
	socket.on('add new player',   (spectatorName) => APPEND_TO_DOM(spectatorName, spectatorList));
	socket.on('add blue player', (bluePlayerName) => APPEND_TO_DOM(bluePlayerName, bluePlayerList));
	socket.on('add red player',   (redPlayerName) => APPEND_TO_DOM(redPlayerName, redPlayerList));

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

	let UPDATE_BOARD      = updateHandlers.updateBoard;
	let UPDATE_GAME_WORDS = updateHandlers.updateGameWords;

	/* GAME SETUP HTML LISTENERS */
	startGame_btn.addEventListener("click", () => {
		SET_STARTING_BOARD(socket, bothSpiesExist, gameisNotStarted);
	});

	/* GAME SETUP SOCKET LISTENERS */
	socket.on('gameHasStarted', () => gameisNotStarted = false);
	socket.on('showScores',         (gameData) => SHOW_SCORES(gameData));
	socket.on('setUpGameWords',   (boardWords) => SET_GAME_WORDS(boardWords));
	socket.on('youCanSeeTheBoard', (boardData) => SET_SPY_BOARD_COLORS(boardData));
	socket.on('createHintBox',      (gameData) => CREATE_HINT_BOX(gameData));

	socket.on('updateBoard', (gameData) => UPDATE_BOARD(gameData));
	socket.on('updateGameWords', (gameData) => UPDATE_GAME_WORDS(gameData));

	/* 
		GAME PLAY 
	*/
	const gameplayHandlers = require('./functions/game-setup/game-play-handlers');
	let UPDATE_SCORES = gameplayHandlers.updateScores;
	let SHOW_WAITING_MESSAGE = gameplayHandlers.showWaitingMessage;
	let START_GUESS = gameplayHandlers.startGuess;
	let SHOW_GUESS_MESSAGE = gameplayHandlers.showGuessMessage;
	let REVEAL_HINT = gameplayHandlers.revealHint;
	let SHOW_GUESSER = gameplayHandlers.showGuesser;
	let END_GAME = gameplayHandlers.endGame;

	let cardHandlers = require('./functions/game-setup/card-handlers');
	let SEND_PICKED_CARD_TO_SERVER = cardHandlers.sendPickedCardToServer;
	let REVEAL_CARD_COLOR_EVERYONE = cardHandlers.revealCardColor;
	let REVEAL_CARD_COLOR_SPIES = cardHandlers.revealCardForSpies;
	let ENABLE_GUESSING = cardHandlers.enableGuessing;
	let DISABLE_GUESSING = cardHandlers.disableGuessing;

	/* GAME PLAY HTML LISTENERS */
	document.querySelector("#hint-btn").addEventListener("click", () => START_GUESS(socket));

	for(let i = 0; i < allCards.length; i++) {
		allCards[i].addEventListener("click", (e) => {
			console.log(e.target.localName);
			// handles bug that occurs when user clicks on the word of the card(paragraph tag) instead of the card itself
			let cardPicked = e.target.localName === 'p' ? e.target.parentNode : e.target;
			SEND_PICKED_CARD_TO_SERVER(socket, client, cardPicked)
		});
	}

	/* GAME PLAY SOCKET LISTENERS */
	socket.on('updateScore',       (gameData) => UPDATE_SCORES(gameData));
	socket.on('waitingForBlueSpy', (gameData) => SHOW_WAITING_MESSAGE(gameData, 'blue'));
	socket.on('waitingForRedSpy',  (gameData) => SHOW_WAITING_MESSAGE(gameData, 'red'));
	socket.on('guessMessage',      (gameData) => SHOW_GUESS_MESSAGE(gameData));

	socket.on('revealHint',  (hintData) => REVEAL_HINT(hintData));
	socket.on('showGuesser', (gameData) => SHOW_GUESSER(gameData));
	socket.on('guessHasBeenMade', (gameData) => REVEAL_CARD_COLOR_SPIES(gameData));
	socket.on('revealCardColor',  (gameData) => REVEAL_CARD_COLOR_EVERYONE(socket, gameData));

	socket.on('start guessing phase', () => ENABLE_GUESSING(client));
	socket.on('end guessing phase',   () => DISABLE_GUESSING(client));

	socket.on('blueWins', () => END_GAME('blue', client));
	socket.on('redWins', () => END_GAME('red', client));

	/*
		RESTART
	*/
	const restartHandlers = require('./functions/game-setup/restart-handlers');
	let RESET_DOM_ELEMENTS = restartHandlers.resetDOMelements;
	let RESET_CHAT = restartHandlers.resetChat;
	let REMOVE_SPY_INPUTS = restartHandlers.removeSpyInputs;
	let GENERATE_NEW_BOARD = restartHandlers.generateNewBoard;

	let RESTART_GAME = require('./functions/game-setup/restart-handlers').restartGame;

	/* RESTART GAME HTML LISTENERS */
	restartGame_btn.addEventListener("click", () => RESTART_GAME(socket, client));

	/* RESTART GAME SOCKET LISTENERS */
	socket.on('restartingGame', (playersList) => {
		gameisNotStarted = true;
		bothSpiesExist = false;
		RESET_DOM_ELEMENTS(client);

		// remove all the player names from the client's browser
		for(let i = 0; i < playersList.length; i++) {
			UPDATE_PLAYER_LISTS(socket, playersList[i].username, spectatorList, client);
			REMOVE_FROM_DOM(playersList[i].username, bluePlayerList);
			REMOVE_FROM_DOM(playersList[i].username, redPlayerList);
		}
	});

	socket.on('removeSpyInputs', () => REMOVE_SPY_INPUTS());
	socket.on('resetTheChat',     () => RESET_CHAT());
	socket.on('newBoard', (gameData) => GENERATE_NEW_BOARD(gameData));
}