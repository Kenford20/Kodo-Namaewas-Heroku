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
// const instructionMessage = document.querySelector("#instruction"); remove all messages above for this and just modify this

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
	for(i=0; i<allCards.length;i++){
		let randomIndex = boardObject.randomIndices[i];
		let randomCardColor = boardObject.divColors[randomIndex];
		allCards[i].classList.add(randomCardColor);
	}
}

function createHintBox(gameData){
	document.querySelector("#input-hint").classList.remove("hide");
	document.querySelector("#hint-btn").classList.remove("hide");
	var numCards;
	var selectNode = document.createElement("select");
	document.querySelector("#hint").appendChild(selectNode);
	
	if(gameData.isBlueTurn)
		numCards = gameData.numBlueCards;
	else
		numCards = gameData.numRedCards;

	console.log(numCards);
    for(i=1; i<(numCards+1); i++){
    	var selectOption = document.createElement("option");
    	selectOption.setAttribute("value", i);
    	selectOption.innerHTML = i;
    	selectNode.appendChild(selectOption);
	}
	console.log(selectNode);
}

function blueTeamWaits(gameData){
	if(!gameData.gameOver){
		document.querySelector("#message").classList.add("hide");
		blueWaitingMessage.classList.remove("hide");
		redWaitingMessage.classList.add("hide");
		redGuessMessage.classList.add("hide");
		resetMessage.classList.add("hide");
		document.querySelector("#hint-message").classList.add("hide");
	}
}

function redTeamWaits(gameData){
	if(!gameData.gameOver){
		document.querySelector("#message").classList.add("hide");
		redWaitingMessage.classList.remove("hide");
		blueWaitingMessage.classList.add("hide");
		blueGuessMessage.classList.add("hide");
		resetMessage.classList.add("hide");
		document.querySelector("#hint-message").classList.add("hide");
	}
}

// runs when hint submission button is clicked
// hides the hint input from the spy master once the hint is submitted
function startGuess(){
	socket.emit('guessMessage');

	var hintData = {
		word: '',
		number: 0,
		isBlueTurn: false,
		isRedTurn: false
	};

	hintData.word = document.querySelector("#input-hint").value;
	hintData.number = document.querySelector("select").value;
	socket.emit('hintSubmitted', hintData);

	document.querySelector("#input-hint").classList.add("hide");
	document.querySelector("#hint-btn").classList.add("hide");
	var select = document.querySelector("select");
	select.parentNode.removeChild(select);

	socket.emit('readyToGuess');
}

// reveals a message to all clients prompting them to guess
function guessMessage(gameData){
	resetMessage.classList.add("hide");
	if(gameData.isBlueTurn){
		blueWaitingMessage.classList.add("hide");
		blueGuessMessage.classList.remove("hide");
	}
	else{
		redWaitingMessage.classList.add("hide");
		redGuessMessage.classList.remove("hide");
	}
}

// reveals the hint to all clients, showing the word and number
function revealHint(hintData){
	document.querySelector("#hint-message").classList.remove("hide");

	var hintWord = document.querySelector("#input-hint");
	document.querySelector("#hint-word").innerHTML = hintData.word;

	var hintNumber = document.querySelector("select");
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

// creates an event listener for all the cards and sends the card info on click
function pickCards(gameData){
	client.canGuess = true;
}

// determines which card was selected based on the index in the array of cards
function whichCardWasPicked(){
	console.log(client.canGuess);
	if(client.canGuess){
		var cardCounter = 0;

		for(i=0;i<allCards.length;i++){
			if(allCards[i] == this) // this = the card selected
				break;
			else{
				cardCounter++;
			}
		}
		console.log(cardCounter);
		socket.emit('cardWasPicked', cardCounter);
		socket.emit('showGuesser', client.name);
	}
}

function showGuesser(gameData){

	if(gameData.isBlueTurn){
		document.querySelector("#blue-guess-name").innerHTML = gameData.playerWhoGuessed;
		var wordPicked = allCards[gameData.cardSelected].querySelector("a").innerHTML
		document.querySelector("#blue-guess-word").innerHTML = wordPicked;
		document.querySelector("#blue-guesser").classList.remove("hide");
	}
	else if(gameData.isRedTurn){
		document.querySelector("#red-guess-name").innerHTML = gameData.playerWhoGuessed;
		var wordPicked = allCards[gameData.cardSelected].querySelector("a").innerHTML
		document.querySelector("#red-guess-word").innerHTML = wordPicked;
		document.querySelector("#red-guesser").classList.remove("hide");
	}
}

// just changes styles for spies when a card is selected so they know what the guesses are
function revealCardForSpies(gameData){
	var word = allCards[gameData.cardSelected].querySelector("a");
	word.style.textDecoration = "line-through";

	if(gameData.gameBoardColors[gameData.cardSelected] == 'blue'){
		allCards[gameData.cardSelected].classList.remove('blue');
		allCards[gameData.cardSelected].classList.add('blue2');
	}
	else if(gameData.gameBoardColors[gameData.cardSelected] == 'red'){
		allCards[gameData.cardSelected].classList.remove('red');
		allCards[gameData.cardSelected].classList.add('red2');
	}
	else if(gameData.gameBoardColors[gameData.cardSelected] == 'yellow'){
		allCards[gameData.cardSelected].classList.remove('yellow');
		allCards[gameData.cardSelected].classList.add('yellow2');		
	}
	else{
		allCards[gameData.cardSelected].classList.remove('black');
		allCards[gameData.cardSelected].classList.add('black2');
	}
}

// receives the selected card from above and reveals its true color from the game board
// turn ends when the number of selected cards match the number given in the hint
// turn also ends when a yellow or a card from the opposite team is selected
function revealCardColor(gameData){	
	var cardSelected = gameData.cardSelected;
	console.log("card selected: " +cardSelected);
	allCards[cardSelected].classList.remove("default");
	allCards[cardSelected].classList.add(gameData.gameBoardColors[cardSelected]);
	socket.emit('updateCardCount', gameData.gameBoardColors[cardSelected]);

	if(gameData.numCardsPicked < gameData.numCardsToGuess){
		if(gameData.gameBoardColors[cardSelected] == 'yellow'){
			socket.emit('endTurn');
			console.log("turn has ended becasue you chose a yellow card");
		}
		if(gameData.isBlueTurn)
			if(gameData.gameBoardColors[cardSelected] == 'red'){
				socket.emit('endTurn');
				console.log("turn has ended because you chose the opposite team color (red)");
			}
		if(gameData.isRedTurn)
			if(gameData.gameBoardColors[cardSelected] == 'blue'){
				socket.emit('endTurn');
				console.log("turn has ended because you chose the opposite team color (blue)");
			}
		if(gameData.gameBoardColors[cardSelected] == 'black'){
			console.log("game over: black card");
			socket.emit('blackCard');
		}
	}
	else{
		if(gameData.gameBoardColors[cardSelected] == 'black')
			socket.emit('blackCard');
		else{
			socket.emit('updateCardCount', gameData.gameBoardColors[cardSelected]);
			socket.emit('endTurn');
			console.log("turn has ended, out of card selections");
		}
	}
}

function disableEventListeners(){
	console.log("disabling event listeners");
	client.canGuess = false;
}

function blueWins(){
	document.querySelector("#blue-wins").classList.remove("hide");
	document.querySelector("#congrats").classList.remove("hide");
	document.querySelector("#congrats").classList.add("blue-word");
	document.querySelector("#hint-message").classList.add("hide");
	blueWaitingMessage.classList.add("hide");
	redWaitingMessage.classList.add("hide");
	blueGuessMessage.classList.add("hide");
	redGuessMessage.classList.add("hide");
}

function redWins(){
	document.querySelector("#red-wins").classList.remove("hide");
	document.querySelector("#congrats").classList.remove("hide");
	document.querySelector("#congrats").classList.add("red-word");
	document.querySelector("#hint-message").classList.add("hide");
	blueWaitingMessage.classList.add("hide");
	redWaitingMessage.classList.add("hide");
	blueGuessMessage.classList.add("hide");
	redGuessMessage.classList.add("hide");
}

function restartGame(){
	console.log("restarting game");
	socket.emit('restartGame');
}

// removes all the classes from the card divs to reset the board
function newBoard(gameData){
	console.log("creating new game");

	for(i=0; i<gameData.currentBoardColors.length; i++){
		allCards[i].classList.remove("red");
		allCards[i].classList.remove("blue");
		allCards[i].classList.remove("yellow");
		allCards[i].classList.remove("black");
	}
}

function resetSpyBoard(gameData){
	for(i=0; i<allCards.length; i++){
		var word = allCards[i].querySelector("a");
		word.style.textDecoration = "none";
	}

	for(i=0; i<allCards.length; i++){
		allCards[i].classList.remove("red2");
		allCards[i].classList.remove("blue2");
		allCards[i].classList.remove("yellow2");
		allCards[i].classList.remove("black2");
	}

	document.querySelector("#input-hint").classList.add("hide");
	document.querySelector("#hint-btn").classList.add("hide");
	var select = document.querySelector("select");
	select.parentNode.removeChild(select);
}

function resetChat(){
	var allGlobalMessages = chatBox.querySelectorAll("h5");
	var allTeamMessages = teamChatBox.querySelectorAll("h5");

	for(i=0; i<allGlobalMessages.length ;i++)
		chatBox.removeChild(allGlobalMessages[i]);
	for(i=0; i<allTeamMessages.length ;i++)
		teamChatBox.removeChild(allTeamMessages[i]);
}

function resetWords(){
	var gameWords = gameBoard.querySelectorAll("a");
	for(i=1;i<26;i++){
		defaultWord = "Word" + i;
		gameWords[(i-1)].innerHTML = defaultWord;
	}
}

function removePlayers(playerData){

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
	console.log(playerData.allPlayers.length);
	for(j=0; j<playerData.allPlayers.length;j++){
		removeSpectator(playerData.allPlayers[j]);
		removeBluePlayer(playerData.allPlayers[j]);
		removeRedPlayer(playerData.allPlayers[j]);
	}

	// reset all buttons and messages
	blueSpy_btn.classList.remove("hide");
	redSpy_btn.classList.remove("hide");
	submit_name.classList.remove("hide");
	name.classList.remove("hide");
	resetMessage.classList.remove("hide");
	document.querySelector("#blue-spy-message").classList.add("hide");
	document.querySelector("#red-spy-message").classList.add("hide");
	document.querySelector("#team-chat-div").classList.add("chat-black");
	document.querySelector("#team-chat-div").classList.remove("team-chat-blue");
	document.querySelector("#team-chat-div").classList.remove("team-chat-red");
	blueWaitingMessage.classList.add("hide");
	redWaitingMessage.classList.add("hide");
	blueGuessMessage.classList.add("hide");
	redGuessMessage.classList.add("hide");
	document.querySelector("#blue-wins").classList.add("hide");
	document.querySelector("#red-wins").classList.add("hide");
	document.querySelector("#congrats").classList.add("hide");
	document.querySelector("#hint-message").classList.add("hide");
	document.querySelector("#blue-guesser").classList.add("hide");
	document.querySelector("#red-guesser").classList.add("hide");
	document.querySelector("#chat").classList.add("hide");
	document.querySelector("#message").classList.remove("hide");
	document.querySelector("#blue-score").classList.add("hide");
	document.querySelector("#red-score").classList.add("hide");

}

function chatEntered(){
	if(event.keyCode == 13){
		if(client.name != ''){
			let chatData = {
				chatter: '',
				chatMessage: ''
			};
			chatData.chatter = client.name;
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
		if(client.team != ''){
			let teamChatData = {
				teamChatter: '',
				chatterTeamColor: '',
				teamChatMessage: ''
			};
			teamChatData.teamChatter = client.name;
			teamChatData.chatterTeamColor = client.team;
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

function displayChatMessage(playerData){
	let chatMessage = document.createElement("h5");
	let chatter = document.createElement("span");
	let chatterNode = document.createTextNode(playerData.chatter);
	chatter.appendChild(chatterNode);
	console.log(chatter);
	socket.emit('chatterSpan');
	chatMessage.appendChild(chatter);
	let chatText = ": " + playerData.chatMessage;
	let messageNode = document.createTextNode(chatText);

	chatMessage.appendChild(messageNode);
	chatMessage.classList.add("chat-message");

	// create the message in the team chat box if message was entered in there
	if(playerData.isTeamMessage)
		teamChatBox.appendChild(chatMessage);
	// else create it in the global chat box
	else
		chatBox.appendChild(chatMessage);

	chatBox.scrollTop = chatBox.scrollHeight;
	teamChatBox.scrollTop = teamChatBox.scrollHeight;
}

function highlightChatter(){
	var chatterSpan = chat.querySelectorAll("span");
	console.log(chatterSpan);
	for(i=0;i<chatterSpan.length;i++){
		console.log(chatterSpan[i].innerHTML);
		console.log(client.name);
		if((chatterSpan[i].innerHTML) == client.name){
			console.log("class is added");
			chatterSpan[i].classList.add("highlight-chatter");
		}
	}
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

for(i=0; i<allCards.length; i++){
	allCards[i].addEventListener("click", whichCardWasPicked);
}

}