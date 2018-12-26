window.onload=function(){
	//const socket = io.connect();
	const host = window.location.origin; 
	console.log(host);
	const socket = io.connect(host);
	//const socket = io.connect('http://' + host + ":"  + 3000);
	
/* Global variables
**********************************/
const joinBlue_btn = document.querySelector("#blue");
const joinRed_btn = document.querySelector("#red");
const redSpy_btn = document.querySelector("#red-spy");
const blueSpy_btn = document.querySelector("#blue-spy");
const startGame_btn = document.querySelector("#start-game");
const blueScoreValue = document.querySelector("#blue-score-number");
const redScoreValue = document.querySelector("#red-score-number");
const restartGame_btn = document.querySelector("#restart-game");
const hint_btn = document.querySelector("#hint-btn");
const submit_name = document.querySelector("#name_btn");
const name = document.querySelector("#name");
const chat = document.querySelector("#chat");
const chatInput = document.querySelector("#chat-input");
const teamChatInput = document.querySelector("#team-chat-input");
const chatBox = document.querySelector("#chat-box");
const teamChatBox = document.querySelector("#team-chat-box");
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
	spymaster: false,
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
let thereIsABlueSpy = false; 
let thereIsARedSpy = false;

/* Function Definitions
*************************************/
function hideElements(...elements){
	elements.map(element => element.classList.add("hide"));
}

function showElements(...elements){
	elements.map(element => element.classList.remove("hide"));
}

// the functions below generate the HTML of each player with their respect teams to
// the currently connected clients and also the ones that join later
function sendNameToServer(){
	console.log("the name is " + name.value);
	socket.emit('playerName', name.value);
	client.name = name.value;
	hideElements(submit_name, name);
}

function createSpectators(spectatorData){
	createName(spectatorData, spectatorList);
}

function createBluePlayers(bluePlayerData){
	createName(bluePlayerData, bluePlayerList);
}

function createRedPlayers(redPlayerData){
	createName(redPlayerData, redPlayerList);
}

function createName(playerName, elementLocation){
	let player = document.createElement("h3");
	let node = document.createTextNode(playerName + "  ");
	player.appendChild(node);
	elementLocation.appendChild(player);
	name.value = "";
}

// update functions below update joining clients' DOMs by appending the player names to their respective nodes
// as well as the current state of the board if a round had began
function currentSpectators(allSpectators){
	updateCurrentPlayers(allSpectators, spectatorList);
}

function currentBluePlayers(allBluePlayers){
	updateCurrentPlayers(allBluePlayers, bluePlayerList);
}

function currentRedPlayers(allRedPlayers){
	updateCurrentPlayers(allRedPlayers, redPlayerList);
}

function updateCurrentPlayers(playerNames, elementLocation){
	playerNames.map(playerName => {
		let player = document.createElement("h3");
		let node = document.createTextNode(playerName + "  ");
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
		let gameWords = gameBoard.querySelectorAll("a");	
		for(let i = 0; i < gameWords.length; i++){
			gameWords[i].innerHTML = gameData.gameWords[i];
		}
		document.querySelector("#message").classList.add("hide");
	}
}

// you can join a team if game has not started yet
// you cannot join a team that you're already on
// you cannot join a team unless you have a name
function joinBlueTeam(){
	if(gameisNotStarted && client.name != '' && client.team != 'blue'){
		socket.emit('blue', client.name);
		client.team = 'blue';
		client.teamJoinCounter++;
		// style team chat box border to blue
		document.querySelector("#team-chat-div").classList.remove("chat-black");
		document.querySelector("#team-chat-div").classList.remove("team-chat-red");
		document.querySelector("#team-chat-div").classList.add("team-chat-blue");
		if(client.spymaster == true){
			client.spymaster = false;
			socket.emit('redSpyChangedTeam');
		}
	}
}

function joinRedTeam(){
	if(gameisNotStarted && client.name != '' && client.team != 'red'){
		socket.emit('red', client.name);
		client.team = 'red';
		client.teamJoinCounter++;
		// style team chat box border to red
		document.querySelector("#team-chat-div").classList.remove("chat-black");
		document.querySelector("#team-chat-div").classList.remove("team-chat-blue");
		document.querySelector("#team-chat-div").classList.add("team-chat-red");
		if(client.spymaster == true){
			client.spymaster = false;
			socket.emit('blueSpyChangedTeam');
		}
	}
}

// take your name out of the spectator list once you join a team
function removeSpectator(playerName){
	let spectators 	= spectatorList.querySelectorAll("h3");
	for(let i = 0; i < spectators.length; i++){
		if(spectators[i].innerHTML == (playerName + '  '))
			spectatorList.removeChild(spectators[i]);
	}
	console.log(client.name + " is on a team: " + client.isOnATeam);

	// handles team changing of clients (you're switching teams if counter > 1)
	if(client.teamJoinCounter > 1 && client.name == playerName){
		if(client.team == "red")
			socket.emit('removeFromBlue', playerName);
		else if(client.team == "blue" && client.name == playerName)
			socket.emit('removeFromRed', playerName);
	}
	client.isOnATeam = true;
}

// send client information to server about the spies
function redSpyMaster(){
	if(client.team == 'red'){
		client.spymaster = true;
		socket.emit('redSpy', client.name);
	}
}

function blueSpyMaster(){
	if(client.team == 'blue'){
		client.spymaster = true;
		socket.emit('blueSpy', client.name);
	}
}

// remove spy button if someone has selected it already and reveal message that shows who the spy is
function removeRedSpyButton({ redSpyExists, redSpyMaster }){
	if(redSpyExists){
		let redSpy = document.querySelector("#red-spy-message");
		document.querySelector("#red-spy-name").innerHTML = redSpyMaster;
		
		hideElements(redSpy_btn);
		showElements(redSpy);
		thereIsARedSpy = true;
		socket.emit('highlightRedSpy', redSpyMaster);
	}
}

function removeBlueSpyButton({ blueSpyExists, blueSpyMaster }){
	if(blueSpyExists){
		let blueSpy = document.querySelector("#blue-spy-message");
		document.querySelector("#blue-spy-name").innerHTML = blueSpyMaster;

		hideElements(blueSpy_btn);	
		showElements(blueSpy);
		thereIsABlueSpy = true;
		socket.emit('highlightBlueSpy', blueSpyMaster);
	}
}

// adds a css background to the player that is the spy master for everyone to see
function highlightRedSpy(nameOfSpy){
	let redPlayers = redPlayerList.querySelectorAll("h3");
	for(let i = 0; i < redPlayers.length; i++){
		if(redPlayers[i].innerHTML == (nameOfSpy + '  ')){
			redPlayers[i].style.background = "grey";
			redPlayers[i].style.border = "2px solid lightgrey";
		}
	}
}

function highlightBlueSpy(nameOfSpy){
	let bluePlayers = bluePlayerList.querySelectorAll("h3");
	for(let i = 0; i < bluePlayers.length; i++){
		if(bluePlayers[i].innerHTML == (nameOfSpy + '  ')){
			bluePlayers[i].style.background = "grey";
			bluePlayers[i].style.border = "2px solid lightblue"
		}
	}
}

// removes the HTML and name of a exiting or team switching player
function removeBluePlayer(playerName){
	// blue player switches to red team
	let bluePlayers = bluePlayerList.querySelectorAll("h3");
	for(let i = 0; i < bluePlayers.length; i++){
		if(bluePlayers[i].innerHTML == (playerName + '  '))
			bluePlayerList.removeChild(bluePlayers[i]);
	}
}

function removeRedPlayer(playerName){
	// red player switches to blue team
	let redPlayers = redPlayerList.querySelectorAll("h3");
	for(let i = 0; i < redPlayers.length; i++){
		if(redPlayers[i].innerHTML == (playerName + '  '))
			redPlayerList.removeChild(redPlayers[i]);
	}
}

// need to show the spy button when a current spy leaves so that a new player can be it
function showBlueSpyButton(){
	client.spymaster = false;
	showElements(blueSpy_btn);
	hideElements(document.querySelector("#blue-spy-message"));
}

function showRedSpyButton(){
	client.spymaster = false;
	showElements(redSpy_btn);
	hideElements(document.querySelector("#red-spy-message"));
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
	socket.emit('gameHasStarted');

	// start game only when the two spymasters are chosen
	if(thereIsABlueSpy && thereIsARedSpy && gameisNotStarted){
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
	}
}

// reveals the scores for both teams when game starts
function showScores(gameData){
	blueScoreValue.innerHTML = gameData.numBlueCards;
	redScoreValue.innerHTML = gameData.numRedCards;
	showElements(document.querySelector("#blue-score"), document.querySelector("#red-score"));
}

// updates the scores whenever a card is picked
function updateScore(gameData){
	blueScoreValue.innerHTML = gameData.numBlueCards;
	redScoreValue.innerHTML = gameData.numRedCards;
}

function setUpGameWords(boardWords){
	let gameWords = gameBoard.querySelectorAll("a");
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
		document.querySelector("#input-hint"), 
		document.querySelector("#hint-btn")
	);
	let selectNode = document.createElement("select");
	document.querySelector("#hint").appendChild(selectNode);
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

	hideElements(
		document.querySelector("#input-hint"),
		document.querySelector("#hint-btn")
	)
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
		let wordPicked = allCards[cardSelected].querySelector("a").innerHTML
		document.querySelector("#blue-guess-word").innerHTML = wordPicked;
		showElements(document.querySelector("#blue-guesser"));
	}
	else if(isRedTurn){
		document.querySelector("#red-guess-name").innerHTML = playerWhoGuessed;
		let wordPicked = allCards[cardSelected].querySelector("a").innerHTML
		document.querySelector("#red-guess-word").innerHTML = wordPicked;
		showElements(document.querySelector("#red-guesser"));
	}
}

// just changes styles for spies when a card is selected so they know what the guesses are
function revealCardForSpies({ cardSelected, gameBoardColors }){
	let word = allCards[cardSelected].querySelector("a");
	word.style.textDecoration = "line-through";

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
}

// receives the selected card from above and reveals its true color from the game board
// turn ends when the number of selected cards match the number given in the hint
// turn also ends when a yellow or a card from the opposite team is selected
function revealCardColor({ cardSelected, gameBoardColors, numCardsPicked, numCardsToGuess, isBlueTurn, isRedTurn }){	
	allCards[cardSelected].classList.remove("default");
	allCards[cardSelected].classList.add(gameBoardColors[cardSelected]);
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

	// for(let i = 0; i < chatterSpan.length; i++){
	// 	if((chatterSpan[i].innerHTML) == client.name){
	// 		chatterSpan[i].classList.add("highlight-chatter");
	// 	}
	// }
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

function resetSpyBoard(){
	for(let i = 0; i < allCards.length; i++){
		allCards[i].classList.remove("red2");
		allCards[i].classList.remove("blue2");
		allCards[i].classList.remove("yellow2");
		allCards[i].classList.remove("black2");

		let word = allCards[i].querySelector("a");
		word.style.textDecoration = "none";
	}
	hideElements(
		document.querySelector("#input-hint"),
		document.querySelector("#hint-btn")
	);
	let select = document.querySelector("select");
	select.parentNode.removeChild(select);
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
	client.spymaster = false;
	client.yourTurn = false;
	client.teamJoinCounter = 0;
	client.isOnATeam = false;
	client.canGuess = false;

	gameisNotStarted = true;
	thereIsABlueSpy = false; 
	thereIsARedSpy = false;

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
		submit_name,
		name,
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
socket.on('playerNames', createSpectators);
socket.on('displayChatMessage', displayChatMessage);
socket.on('displayTeamChat', displayChatMessage);
socket.on('showClientChatter', highlightChatter);
// updating new players who joined later than others
socket.on('allSpectators', currentSpectators);
socket.on('allBluePlayers', currentBluePlayers);
socket.on('allRedPlayers', currentRedPlayers);
socket.on('nameOfBlueSpy', removeBlueSpyButton);
socket.on('nameOfRedSpy', removeRedSpyButton);
socket.on('updateBoard', updateBoard);
socket.on('updateGameWords', updateGameWords);

// move the clients' name to their respective teams
socket.on('bluePlayer', createBluePlayers);
socket.on('redPlayer', createRedPlayers);
socket.on('removeSpectator', removeSpectator);
socket.on('bluePlayerLeft', removeBluePlayer);
socket.on('redPlayerLeft', removeRedPlayer);
socket.on('spectatorLeft', removeSpectator);

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

/* Event Listeners
***********************************/
submit_name.addEventListener("click", sendNameToServer);
joinBlue_btn.addEventListener("click", joinBlueTeam);
joinRed_btn.addEventListener("click", joinRedTeam);
blueSpy_btn.addEventListener("click", blueSpyMaster);
redSpy_btn.addEventListener("click", redSpyMaster);
startGame_btn.addEventListener("click", gameStartSetup);
restartGame_btn.addEventListener("click", restartGame);
hint_btn.addEventListener("click", startGuess);
chatInput.addEventListener("keyup", chatEntered);
teamChatInput.addEventListener("keyup", teamChatEntered);

// add a click listener to all cards
for(let i = 0; i < allCards.length; i++)
	allCards[i].addEventListener("click", whichCardWasPicked);
}