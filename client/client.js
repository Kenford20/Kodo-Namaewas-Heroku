window.onload=function(){
	const host = window.location.origin; 
	const socket = io.connect(host);

/*
	Global variables
*/
const joinBlue_btn = document.querySelector("#blue-join-btn");
const joinRed_btn = document.querySelector("#red-join-btn");
const redSpy_btn = document.querySelector("#red-spy");
const blueSpy_btn = document.querySelector("#blue-spy");
const startGame_btn = document.querySelector("#start-game");
const restartGame_btn = document.querySelector("#restart-game");
const submitName_btn = document.querySelector("#name-btn");

const blueScoreValue = document.querySelector("#blue-score-number");
const redScoreValue = document.querySelector("#red-score-number");
const hintInput = document.querySelector("#hint-input-container");
const nameInput = document.querySelector("#name-input");
const chat = document.querySelector("#chat");
const chatInput = document.querySelector("#chat-input");
const teamChatInput = document.querySelector("#team-chat-input");
const chatBox = document.querySelector("#global-message-box");
const teamChatBox = document.querySelector("#team-message-box");
const gameBoard = document.querySelector("#game-board");
const allCards = document.querySelectorAll(".card");

const blueWaitingMessage = document.querySelector("#blue-waiting");
const redWaitingMessage = document.querySelector("#red-waiting");
const blueGuessMessage = document.querySelector("#blue-guess");
const redGuessMessage = document.querySelector("#red-guess");
const resetMessage = document.querySelector("#reset-message");

const spectatorList = document.querySelector("#players");
const bluePlayerList = document.querySelector("#blue-players");
const redPlayerList = document.querySelector("#red-players");

const client = {
	name: '',
	team: '',
	isSpymaster: false,
	yourTurn: false,
	teamJoinCounter: 0,
	isOnATeam: false,
	canGuess: false
};

const cardType = {
	redTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
	blueTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
};

let gameisNotStarted = true;
let bothSpiesExist = false;

/* 
	MODULE IMPORTS
*/
const updateHandlers = require('./functions/update-handlers');
let UPDATE_CURRENT_PLAYERS = updateHandlers.updateCurrentPlayers;
let UPDATE_BOARD = updateHandlers.updateBoard;
let UPDATE_GAME_WORDS = updateHandlers.updateGameWords;

const nameHandlers = require('./functions/player-setup/name-handlers');
let SEND_NAME_TO_SERVER = nameHandlers.sendNameToServer;
let APPEND_TO_DOM = nameHandlers.appendToDOM;
let REMOVE_FROM_DOM = nameHandlers.removeFromDOM;

const teamHandlers = require('./functions/team-setup/team-handlers');
let HANDLE_JOIN_TEAM = teamHandlers.handleJoinTeam;


/* 
	EVENT LISTENERS
*/
submitName_btn.addEventListener("click", () => {
	SEND_NAME_TO_SERVER(socket, 'newPlayerJoined', nameInput.value);
	client.name = nameInput.value;
	hideElements(submitName_btn, nameInput);
});

joinBlue_btn.addEventListener("click", () => {
	if(client.team != 'blue' && client.name != '') {
		HANDLE_JOIN_TEAM(socket, gameisNotStarted, 'blue', client);
		console.log(client);
	}
});

joinRed_btn.addEventListener("click", () => {
	if(client.team != 'red' && client.name != '') {
		HANDLE_JOIN_TEAM(socket, gameisNotStarted, 'red', client);
		console.log(client);
	}
});

blueSpy_btn.addEventListener("click", blueSpyMaster);
redSpy_btn.addEventListener("click", redSpyMaster);
startGame_btn.addEventListener("click", gameStartSetup);
restartGame_btn.addEventListener("click", restartGame);
document.querySelector("#hint-btn").addEventListener("click", startGuess);
chatInput.addEventListener("keyup", chatEntered);
teamChatInput.addEventListener("keyup", teamChatEntered);

// add a click listener to all cards
for(let i = 0; i < allCards.length; i++)
	allCards[i].addEventListener("click", whichCardWasPicked);

function hideElements(...elements){
	elements.map(element => {
		if(element)
			element.classList.add("hide");
	});
}

function showElements(...elements){
	elements.map(element => {
		if(element)
			element.classList.remove("hide");
	});
}

/* 
	SOCKET LISTENERS
*/
socket.on('add new player', (spectatorName) => {
	APPEND_TO_DOM(spectatorName, spectatorList)
});

socket.on('add blue player', (bluePlayerName) => {
	APPEND_TO_DOM(bluePlayerName, bluePlayerList)
});

socket.on('add red player', (redPlayerName) => {
	APPEND_TO_DOM(redPlayerName, redPlayerList)
});

socket.on('update players for new connection', ({ spectators, bluePlayers, redPlayers }) => {
	UPDATE_CURRENT_PLAYERS(spectators, spectatorList);
	UPDATE_CURRENT_PLAYERS(bluePlayers, bluePlayerList);
	UPDATE_CURRENT_PLAYERS(redPlayers,  redPlayerList);
});

socket.on('bothSpiesExist', (doBothSpiesExist) => {
	bothSpiesExist = doBothSpiesExist;
});

socket.on('removeSpectator', removeSpectator);
socket.on('spectatorLeft', removeSpectator);

socket.on('bluePlayerLeft', (bluePlayer) => {
	REMOVE_FROM_DOM(bluePlayer, bluePlayerList);
});

socket.on('redPlayerLeft', (redPlayer) => {
	REMOVE_FROM_DOM(redPlayer, redPlayerList);
});

function removeSpectator(spectatorName){
	REMOVE_FROM_DOM(spectatorName, spectatorList);
	console.log(client.name + " is on a team: " + client.isOnATeam);

	// handles team changing of clients (you're switching teams if counter > 1)
	if(client.teamJoinCounter > 1 && client.name == spectatorName){
		if(client.team == "red")
			socket.emit('removeFromBlue', spectatorName);
		else if(client.team == "blue" && client.name == spectatorName)
			socket.emit('removeFromRed', spectatorName);
	}
	client.isOnATeam = true;
}

// send client information to server about the spies
function redSpyMaster(){
	if(client.team == 'red'){
		client.isSpymaster = true;
		socket.emit('redSpySelected', client.name);
	}
}

function blueSpyMaster(){
	if(client.team == 'blue'){
		client.isSpymaster = true;
		socket.emit('blueSpySelected', client.name);
	}
}

// remove spy button if someone has selected it already and reveal message that shows who the spy is
function removeRedSpyButton({ redSpyExists, redSpyMaster }){
	if(redSpyExists){
		document.querySelector("#red-spy-name").innerHTML = redSpyMaster;
		
		hideElements(redSpy_btn, document.querySelector("#red-spy-waiting"));
		showElements(document.querySelector("#reveal-red-spy"));
		socket.emit('highlightRedSpy', redSpyMaster);
	}
}

function removeBlueSpyButton({ blueSpyExists, blueSpyMaster }){
	if(blueSpyExists){
		document.querySelector("#blue-spy-name").innerHTML = blueSpyMaster;

		hideElements(blueSpy_btn, document.querySelector("#blue-spy-waiting"));
		showElements(document.querySelector("#reveal-blue-spy"));
		socket.emit('highlightBlueSpy', blueSpyMaster);
	}
}

// adds a css background to the player that is the spy master for everyone to see
function highlightRedSpy(nameOfSpy){
	let redPlayers = redPlayerList.querySelectorAll("h3");
	for(let i = 0; i < redPlayers.length; i++){
		if(redPlayers[i].innerHTML == nameOfSpy){
			redPlayers[i].style.background = "grey";
			redPlayers[i].style.border = "2px solid lightgrey";
			redPlayers[i].style.padding = "5px";
		}
	}
}

function highlightBlueSpy(nameOfSpy){
	let bluePlayers = bluePlayerList.querySelectorAll("h3");
	for(let i = 0; i < bluePlayers.length; i++){
		if(bluePlayers[i].innerHTML == nameOfSpy){
			bluePlayers[i].style.background = "grey";
			bluePlayers[i].style.border = "2px solid lightblue"
			bluePlayers[i].style.padding = "5px";
		}
	}
}

// need to show the spy button when a current spy leaves so that a new player can be it
function showBlueSpyButton(){
	client.isSpymaster = false;
	showElements(blueSpy_btn, document.querySelector("#blue-spy-waiting"));
	hideElements(document.querySelector("#reveal-blue-spy"));
}

function showRedSpyButton(){
	client.isSpymaster = false;
	showElements(redSpy_btn, document.querySelector("#red-spy-waiting"));
	hideElements(document.querySelector("#reveal-red-spy"));
}

/* 
****************************************************************
************ GAME HAS NOW STARTED BELOW ************************
****************************************************************/

// takes an array of the board's card positions and shuffles the indices around
function shuffleNumbers(cardPositions) {
    let i = cardPositions.length;
    let j = 0;
    let temp;

    while (i--) {
    	// generates a random index to swap with
        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = cardPositions[i];
        cardPositions[i] = cardPositions[j];
        cardPositions[j] = temp;
    }
    return cardPositions;
}

function gameStartSetup(){
	if(bothSpiesExist && gameisNotStarted){
		socket.emit('gameHasStarted');
		let boardData = {
			randomIndices: [],
			divColors: []
		}
		let randomNumbers = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];

		shuffleNumbers(randomNumbers);
		boardData.randomIndices = randomNumbers;
		let randomTeamStarts = Math.floor(Math.random() * 2); // returns 0 or 1

		if(randomTeamStarts == 0){
			boardData.divColors = cardType.blueTeamStarts;
			socket.emit('blueTeamStarts');
		}
		else if(randomTeamStarts == 1){
			boardData.divColors = cardType.redTeamStarts;
			socket.emit('redTeamStarts');
		}
		socket.emit('setUpBoardforSpies', boardData);
		socket.emit('showRestartButton');

		// about 1000 words in this file, can add/remove any words you want to play with in this file
		let possibleWords = getWordsFromFile("words.txt");
		let boardWords = [];

		// take random words from the file of words and push them to the array of 25 words for the game board
		for(let i = 0; i < 25; i++){
			let randomWord = Math.floor(Math.random() * possibleWords.length);
			boardWords.push(possibleWords[randomWord]);
		}
		socket.emit('setUpGameWords', boardWords);
	} else {
		alert('You need atleast 4 players to play, 2 Supaimasutas and 2 guessers!');
	}
}

// reveals the scores for both teams when game starts
function showScores(gameData){
	blueScoreValue.innerHTML = gameData.numBlueCards;
	redScoreValue.innerHTML = gameData.numRedCards;
	//showElements(document.querySelector("#blue-score"), document.querySelector("#red-score"));
	document.querySelector("#blue-score").style.display = "inline-block";
	document.querySelector("#red-score").style.display = "inline-block";
}

// updates the scores whenever a card is picked
function updateScore(gameData){
	blueScoreValue.innerHTML = gameData.numBlueCards;
	redScoreValue.innerHTML = gameData.numRedCards;
}

function setUpGameWords(boardWords){
	let gameWords = gameBoard.querySelectorAll("p");
	for(let i = 0; i < gameWords.length; i++)
		gameWords[i].innerHTML = boardWords[i];
}

function getWordsFromFile(file){
	let fileWords;
    let rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function (){
        if(rawFile.readyState === 4){
            if(rawFile.status === 200 || rawFile.status == 0){
                let allWords = rawFile.responseText;
                fileWords = allWords.split('\n');
            }
        }
    }
    rawFile.send(null);
    return fileWords;
}

function updateGameStatus(){
	gameisNotStarted = false;
}

function spyMasterBoard(boardObject){
	// assign random color to each div or card on the game board
	for(let i = 0; i < allCards.length; i++){
		let randomIndex = boardObject.randomIndices[i];
		let randomCardColor = boardObject.divColors[randomIndex];
		allCards[i].classList.add(randomCardColor);
	}
}

function createHintBox({ isBlueTurn, numBlueCards, numRedCards }){
	showElements(
		document.querySelector("#hint-input-container")
	);
	let selectNode = document.createElement("select");
	document.querySelector("#hint-input-container").insertBefore(selectNode, document.querySelector("#hint-input-container").firstChild);
	let numCards = isBlueTurn ? numBlueCards : numRedCards;

	// create dropdown menu for number of guesses to the hint
    for(let i = 1; i < (numCards+1); i++){
    	let selectOption = document.createElement("option");
    	selectOption.setAttribute("value", i);
    	selectOption.innerHTML = i;
    	selectNode.appendChild(selectOption);
	}
}

function blueTeamWaits({ gameOver }){
	if(!gameOver){
		hideElements(
			redWaitingMessage, 
			redGuessMessage, 
			resetMessage, 
			document.querySelector("#hint-message"), 
			document.querySelector("#message")
		);
		showElements(blueWaitingMessage);
	}
}

function redTeamWaits({ gameOver }){
	if(!gameOver){
		hideElements(
			blueWaitingMessage,
			blueGuessMessage,
			resetMessage,
			document.querySelector("#hint-message"), 
			document.querySelector("#message")
		);
		showElements(redWaitingMessage);
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

	hideElements(hintInput)

	let select = document.querySelector("select");
	select.parentNode.removeChild(select);

	socket.emit('readyToGuess');
}

// reveals a message to all clients prompting them to guess
function guessMessage({ isBlueTurn }){
	hideElements(resetMessage);
	if(isBlueTurn){
		hideElements(blueWaitingMessage);
		showElements(blueGuessMessage);
	}
	else{
		hideElements(redWaitingMessage);
		showElements(redGuessMessage);
	}
}

// reveals the hint to all clients, showing the word and number
function revealHint(hintData){
	showElements(document.querySelector("#hint-message"));
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
	}
}

// reveals the div that shows who guessed the lastly guessed word
function showGuesser({ isBlueTurn, isRedTurn, cardSelected, playerWhoGuessed }){
	if(isBlueTurn){
		document.querySelector("#blue-guess-name").innerHTML = playerWhoGuessed;
		let wordPicked = allCards[cardSelected].querySelector("p").innerHTML
		document.querySelector("#blue-guess-word").innerHTML = wordPicked;
		showElements(document.querySelector("#blue-guesser"));
	}
	else if(isRedTurn){
		document.querySelector("#red-guess-name").innerHTML = playerWhoGuessed;
		let wordPicked = allCards[cardSelected].querySelector("p").innerHTML
		document.querySelector("#red-guess-word").innerHTML = wordPicked;
		showElements(document.querySelector("#red-guesser"));
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
	showElements(
		document.querySelector("#blue-wins"),
		document.querySelector("#congrats")
	);
	hideElements(
		document.querySelector("#hint-message"),
		blueWaitingMessage,
		redWaitingMessage,
		blueGuessMessage,
		redGuessMessage
	);
}

function redWins(){
	document.querySelector("#congrats").classList.add("red-word");
	showElements(
		document.querySelector("#red-wins"),
		document.querySelector("#congrats")
	);
	hideElements(
		document.querySelector("#hint-message"),
		blueWaitingMessage,
		redWaitingMessage,
		blueGuessMessage,
		redGuessMessage
	);
}

// chat functions
function chatEntered(){
	if(event.keyCode == 13){
		const { name } = client;
		if(name != ''){
			const chatData = {
				chatter: '',
				chatMessage: ''
			};
			chatData.chatter = name;
			chatData.chatMessage = chatInput.value;
			socket.emit('someoneChatted', chatData);
			chatInput.value = '';
		}
		else{
			chatInput.value = '';
			alert("Please enter a name before you chat!");
		}
	}
}

function teamChatEntered(){
	if(event.keyCode == 13){
		const { team, name } = client;
		if(team != ''){
			const teamChatData = {
				teamChatter: '',
				chatterTeamColor: '',
				teamChatMessage: ''
			};
			teamChatData.teamChatter = name;
			teamChatData.chatterTeamColor = team;
			teamChatData.teamChatMessage = teamChatInput.value;
			socket.emit('teamChat', teamChatData);
			teamChatInput.value = '';
		}
		else{
			teamChatInput.value = '';
			alert("Please join a team before using team chat!");
		}
	}
}

function displayChatMessage({ chatter, chatMessage, isTeamMessage }){
	socket.emit('chatterSpan');

	let message = document.createElement("h5");
	let chatterName = document.createElement("span");
	let chatterNode = document.createTextNode(chatter);
	chatterName.appendChild(chatterNode);
	message.appendChild(chatterName);

	let chatText = ": " + chatMessage;
	let messageNode = document.createTextNode(chatText);
	message.appendChild(messageNode);
	message.classList.add("chat-message");

	// create the message in the team chat box if message was entered in there
	if(isTeamMessage)
		teamChatBox.appendChild(message);
	// else create it in the global chat box
	else
		chatBox.appendChild(message);

	// keeps the chatbox at the bottom of the scrollbar after overflow occurs within the chatbox div
	chatBox.scrollTop = chatBox.scrollHeight;
	teamChatBox.scrollTop = teamChatBox.scrollHeight;
}

// styles the client's name in the chatbox to differentiate from the other players chat message
function highlightChatter(){
	let chatterNames = [].slice.call(chat.querySelectorAll("span"));
	
	chatterNames.filter(names => names.innerHTML == client.name)
	.map(name => name.classList.add('highlight-chatter'));
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
		hideElements(hintInput);

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
	showElements(
		blueSpy_btn,
		redSpy_btn,
		submitName_btn,
		nameInput,
		resetMessage,
		document.querySelector("#message")
	);
	hideElements(
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
socket.on('displayChatMessage', displayChatMessage);
socket.on('displayTeamChat', displayChatMessage);
socket.on('showClientChatter', highlightChatter);

socket.on('nameOfBlueSpy', removeBlueSpyButton);
socket.on('nameOfRedSpy', removeRedSpyButton);
socket.on('updateBoard', updateBoard);
socket.on('updateGameWords', updateGameWords);

// spy stuff setup
socket.on('someoneBecameBlueSpy', removeBlueSpyButton);
socket.on('someoneBecameRedSpy', removeRedSpyButton);
socket.on('highlightBlueSpy', highlightBlueSpy);
socket.on('highlightRedSpy', highlightRedSpy);
socket.on('blueSpyLeft', showBlueSpyButton);
socket.on('redSpyLeft', showRedSpyButton);
socket.on('blueSpyChangedTeam', showBlueSpyButton);
socket.on('redSpyChangedTeam', showRedSpyButton);

// game started
socket.on('gameHasStarted', updateGameStatus);
socket.on('showScores', showScores);
socket.on('setUpGameWords', setUpGameWords);
socket.on('youCanSeeTheBoard', spyMasterBoard);
socket.on('createHintBox', createHintBox);
socket.on('waitingForBlueSpy', blueTeamWaits);
socket.on('waitingForRedSpy', redTeamWaits);
socket.on('guessMessage', guessMessage);
socket.on('revealHint', revealHint);
socket.on('pickCards', pickCards);
socket.on('showGuesser', showGuesser);
socket.on('updateScore', updateScore);
socket.on('revealCardColor', revealCardColor);
socket.on('guessHasBeenMade', revealCardForSpies);
socket.on('donePickingCards', disableEventListeners);
socket.on('blueWins', blueWins);
socket.on('redWins', redWins);
socket.on('restartingGame', removePlayers);
socket.on('resetSpyBoard', resetSpyBoard);
socket.on('resetTheChat', resetChat);
socket.on('resetWords', resetWords);
socket.on('newBoard', newBoard);
}