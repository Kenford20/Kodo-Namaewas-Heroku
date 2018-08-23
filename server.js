/* Express setup
**********************************/

// imports the npm module that is being used aka express here
var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;  //heroku port or default port 3000

//app.use('/client', express.static(__dirname + '/client'));
app.use(express.static('client'));

// routes
app.get('/',function(req,res){
	res.sendFile(__dirname + '/client/index.html');
	// res.render("index");
});

server.listen(port, function(){
	console.log('Server is running!');
});

// io is an object that is created by the socket function
var io = require('socket.io')(server);

var socketIDlist = [];
var playerData = {
	allPlayers: [],
	chatter: '',
	chatterTeamColor: '',
	chatMessage: '',
	isTeamMessage: false,
	spectators: [],
	spectatorIDs: [],
	bluePlayers: [],
	blueIDs: [],
	redPlayers: [],
	redIDs: [],
	blueSpyExists: false,
	redSpyExists: false,
	blueSpyMaster:'',
	redSpyMaster:'',

	blueSpyID:0,
	redSpyID:0
};

var gameData = {	
	currentBoardColors: ['lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey'],
	gameBoardColors: [],
	gameWords: [],	
	turnCounter: 0,
	isBlueTurn: false,
	isRedTurn: false,
	gameHasStarted: false,
	numBlueCards: 0,
	numRedCards: 0,
	numYellowCards: 7,
	numBlackCards: 1,
	numCardsToGuess: 0,
	numCardsPicked: 0,
	playerWhoGuessed: '',
	cardSelected: 0,
	turnIsOver: false,
	clientCallCounter: 0,
	runOnce: true,
	runOnce2: true,
	runOnce3: true,
	gameOver: false
};

/*socket.io setup
********************************************/
io.sockets.on('connection', function(socket){
	//console.log('socket connection: '+ socket.id);
	socketIDlist.push(socket.id);
		
	//update a new player on the spectators list currently
	socket.emit('allSpectators', playerData.spectators);
	socket.emit('allBluePlayers', playerData.bluePlayers);
	socket.emit('allRedPlayers', playerData.redPlayers);
	socket.emit('nameOfBlueSpy', playerData);
	socket.emit('nameOfRedSpy', playerData);
	socket.emit('updateBoard', gameData);
	socket.emit('updateGameWords', gameData);

	socket.on('disconnect', function(){
		var leavingPlayerIndex = socketIDlist.indexOf(socket.id);
		socketIDlist.splice(leavingPlayerIndex, 1);
		var leavingPlayerName = playerData.allPlayers[leavingPlayerIndex];
		playerData.allPlayers.splice(leavingPlayerIndex,1);

		// check if leaving player is on blue team, then remove from list
		for(i=0;i<playerData.bluePlayers.length; i++){
			if(playerData.bluePlayers[i] == leavingPlayerName){
				playerData.bluePlayers.splice(i, 1);
				io.sockets.emit('bluePlayerLeft', leavingPlayerName);
			}
		}

		for(i=0;i<playerData.redPlayers.length; i++){
			if(playerData.redPlayers[i] == leavingPlayerName){
				playerData.redPlayers.splice(i, 1);
				io.sockets.emit('redPlayerLeft', leavingPlayerName);
			}
		}

		// check if leaving player is a spectator, then remove from list
		for(i=0;i<playerData.spectators.length; i++){
			if(playerData.spectators[i] == leavingPlayerName){
				playerData.spectators.splice(i, 1);
				io.sockets.emit('spectatorLeft', leavingPlayerName);
			}
		}		

		// check if leaving player is a spymaster
		if(socket.id == playerData.blueSpyID){
			playerData.blueSpyExists = false;
			io.sockets.emit('blueSpyLeft');
		}
		else if(socket.id == playerData.redSpyID){
			playerData.redSpyExists = false;
			io.sockets.emit('redSpyLeft');
		}

		console.log("This player has left: " + leavingPlayerName);
	})

	// team setup
	/****************************************/
	socket.on('playerName', function(name){
		//socketIDlist.push(socket.id);
		playerData.spectatorIDs.push(socket.id);
		playerData.allPlayers.push(name);
		playerData.spectators.push(name);
		console.log("spectators after entering: " + playerData.spectators);
		io.sockets.emit('playerNames', name);
	});

	socket.on('someoneChatted', function(chatData){
		playerData.chatter = chatData.chatter;
		playerData.chatMessage = chatData.chatMessage;
		io.sockets.emit('displayChatMessage', playerData);
	})

	socket.on('teamChat', function(teamChatData){
		playerData.chatter = teamChatData.teamChatter;
		playerData.chatMessage = teamChatData.teamChatMessage;
		playerData.chatterTeamColor = teamChatData.chatterTeamColor;
		playerData.isTeamMessage = true;

		if(teamChatData.chatterTeamColor == 'blue'){
			for(i=0;i<playerData.blueIDs.length;i++)
				io.to(playerData.blueIDs[i]).emit('displayTeamChat', playerData);
		}
		else if(teamChatData.chatterTeamColor == 'red'){
			for(i=0;i<playerData.redIDs.length;i++)
				io.to(playerData.redIDs[i]).emit('displayTeamChat', playerData);
		}

		playerData.isTeamMessage = false;
	})

	socket.on('chatterSpan', function(){
		socket.emit('showClientChatter');
	})

	socket.on('blue', function(clientName){
		console.log("Player: " + clientName + " has joined blue team");
		playerData.bluePlayers.push(clientName);
		playerData.blueIDs.push(socket.id);
		io.sockets.emit('bluePlayer', clientName);
		var spectatorIndex = playerData.spectators.indexOf(clientName);
		playerData.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		//console.log("BLUE PLAYER IDS: " + playerData.blueIDs);
		//console.log("spectators after joining blue team: " + playerData.spectators);
	});

	socket.on('removeFromBlue', function(bluePlayerToBeRemoved){
		console.log("current blue players: " + playerData.bluePlayers);
		var bluePlayerIndex = playerData.bluePlayers.indexOf(bluePlayerToBeRemoved);
		playerData.bluePlayers.splice(bluePlayerIndex, 1);
		var bluePlayerID = playerData.blueIDs.indexOf(socket.id);
		playerData.blueIDs.splice(bluePlayerID, 1);
		console.log("Blue players after removal: " + playerData.bluePlayers);
		io.sockets.emit('bluePlayerLeft', bluePlayerToBeRemoved);
	})

	socket.on('red', function(clientName){
		console.log("Player: " + clientName + " has joined red team");
		playerData.isSpectator = false;
		playerData.redPlayers.push(clientName);
		playerData.redIDs.push(socket.id);
		io.sockets.emit('redPlayer', clientName);
		var spectatorIndex = playerData.spectators.indexOf(clientName);
		playerData.spectators.splice(spectatorIndex, 1);
		io.sockets.emit('removeSpectator', clientName);
		//console.log("RED PLAYER IDS: " + playerData.redIDs);
		//console.log("spectators after joining red team: " + playerData.spectators);	
	})

	socket.on('removeFromRed', function(redPlayerToBeRemoved){
		console.log("current red players: " + playerData.redPlayers);
		var redPlayerIndex = playerData.redPlayers.indexOf(redPlayerToBeRemoved);
		playerData.redPlayers.splice(redPlayerIndex, 1);
		var redPlayerID = playerData.redIDs.indexOf(socket.id);
		playerData.redIDs.splice(redPlayerID, 1);
		console.log("Red players after removal: " + playerData.redPlayers);
		io.sockets.emit('redPlayerLeft', redPlayerToBeRemoved);
	})

	socket.on('blueSpy', function(nameOfSpyMaster){
		playerData.blueSpyExists = true;
		playerData.blueSpyMaster = nameOfSpyMaster;
		playerData.blueSpyID = socket.id;
		io.sockets.emit('someoneBecameBlueSpy', playerData);
		//console.log("BLUE SPY ID: " + playerData.blueSpyID);
	})

	socket.on('highlightBlueSpy', function(){
		io.sockets.emit('highlightBlueSpy', playerData.blueSpyMaster);
	})

	socket.on('blueSpyChangedTeam', function(){
		playerData.blueSpyExists = false;
		io.sockets.emit('blueSpyChangedTeam');
	})
	
	socket.on('redSpy', function(nameOfSpyMaster){
		playerData.redSpyExists = true;
		playerData.redSpyMaster = nameOfSpyMaster;
		playerData.redSpyID = socket.id;
		io.sockets.emit('someoneBecameRedSpy', playerData);
		//console.log("RED SPY ID: " + playerData.redSpyID);
	})

	socket.on('highlightRedSpy', function(nameOfRedSpy){
		io.sockets.emit('highlightRedSpy', playerData.redSpyMaster);
	})

	socket.on('redSpyChangedTeam', function(){
		playerData.redSpyExists = false;
		io.sockets.emit('redSpyChangedTeam');
	})


	// game has started
	/***********************************/
	socket.on('gameHasStarted', function(){
		gameData.gameHasStarted = true;
		io.sockets.emit('gameHasStarted');
	})

	socket.on('setUpGameWords', function(boardWords){
		io.sockets.emit('setUpGameWords', boardWords);
		for(i=0;i<boardWords.length;i++){
			gameData.gameWords.push(boardWords[i]);
		}
	})

	socket.on('setUpBoardforSpies', function(boardObject){
		//console.log(boardObject);
		for(i=0;i<boardObject.randomIndices.length; i++){
			let randomIndex = boardObject.randomIndices[i];
			let randomColor = boardObject.divColors[randomIndex];
			gameData.gameBoardColors.push(randomColor);
		}
		console.log(gameData.gameBoardColors);
		io.to(playerData.blueSpyID).emit('youCanSeeTheBoard', boardObject);
		io.to(playerData.redSpyID).emit('youCanSeeTheBoard', boardObject);
	})

	socket.on('blueTeamStarts', function(){
		gameData.isBlueTurn = true;
		gameData.isRedTurn = false;
		gameData.numBlueCards = 9;
		gameData.numRedCards = 8;
		gameData.turnCounter++;
		io.to(playerData.blueSpyID).emit('createHintBox', gameData);
		io.sockets.emit('waitingForBlueSpy', gameData);
		console.log("blue team starts");
	})

	socket.on('redTeamStarts', function(){
		gameData.isRedTurn = true;
		gameData.isBlueTurn = false;
		gameData.numBlueCards = 8;
		gameData.numRedCards = 9;
		gameData.turnCounter++;
		io.to(playerData.redSpyID).emit('createHintBox', gameData);
		io.sockets.emit('waitingForRedSpy', gameData);
		console.log("red team starts");
	})

	// 
	socket.on('guessMessage', function(){
		io.sockets.emit('guessMessage', gameData);
	})

	socket.on('revealHint', function(hintData){
		gameData.numCardsToGuess = hintData.number;
		hintData.isBlueTurn = gameData.isBlueTurn;
		hintData.isRedTurn = gameData.isRedTurn;
		gameData.numCardsPicked = 0;
		gameData.turnIsOver = false;
		gameData.runOnce = true;
		gameData.runOnce2 = true;
		io.sockets.emit('revealHint', hintData);
	})

	socket.on('pickCards', function(){

		// tell only blue players to take their turn
		if(gameData.isBlueTurn){
			for(i=0;i<playerData.blueIDs.length;i++)
				io.to(playerData.blueIDs[i]).emit('pickCards', gameData);
		}
		// otherwise tell red players to
		else{
			for(i=0;i<playerData.redIDs.length;i++)
				io.to(playerData.redIDs[i]).emit('pickCards', gameData);
		}
	})

	socket.on('cardWasPicked', function(cardCounter){
		//gameData.clientCallCounter = 0;
		gameData.clientCallCounter++;
		gameData.numCardsPicked++;
		gameData.cardSelected = cardCounter;
		gameData.runOnce2 = true;
		io.to(playerData.blueSpyID).emit('guessHasBeenMade', gameData);
		io.to(playerData.redSpyID).emit('guessHasBeenMade', gameData);
		io.sockets.emit('revealCardColor', gameData);
	})

	socket.on('showGuesser', function(playerName){
		gameData.playerWhoGuessed = playerName;
		io.sockets.emit('showGuesser', gameData);
	})

	socket.on('updateCardCount', function(colorOfCard){
		//io.sockets.emit('showGuesser', gameData.cardSelected);		
		gameData.clientCallCounter = 0;

		if(gameData.runOnce2){
			gameData.runOnce2 = false;

			gameData.currentBoardColors[gameData.cardSelected] = colorOfCard;

			if(colorOfCard == 'blue')
				gameData.numBlueCards--;
			else if(colorOfCard == 'red')
				gameData.numRedCards--;
			else if(colorOfCard == 'yellow')
				gameData.numYellowCards--;
		
			console.log("blue: " + gameData.numBlueCards + "red: " + gameData.numRedCards + "yellow: " + gameData.numYellowCards);
		
			if(gameData.numBlueCards == 0){
				gameData.gameOver = true;
				io.sockets.emit('blueWins');
			}
			else if(gameData.numRedCards == 0){
				gameData.gameOver = true;
				io.sockets.emit('redWins');
			}
		}
	})

	socket.on('blackCard', function(){
		if(gameData.runOnce3){
			gameData.runOnce3 = false;
			if(gameData.isBlueTurn)
				io.sockets.emit('redWins');
			else
				io.sockets.emit('blueWins');
		}
	})

	socket.on('endTurn', function(){
		gameData.clientCallCounter++;
		gameData.turnIsOver = true;
		console.log("call counter: " +gameData.clientCallCounter);
		if(gameData.runOnce){
			gameData.runOnce = false;
			gameData.turnCounter++;
			if(gameData.isBlueTurn){
				// switch to red team's turn
				console.log("it is now red turn");
				gameData.isBlueTurn = false;
				gameData.isRedTurn = true;
				io.to(playerData.redSpyID).emit('createHintBox', gameData);
				io.sockets.emit('waitingForRedSpy', gameData);
				io.sockets.emit('donePickingCards');
			}
			else if(gameData.isRedTurn){
				// switch to blue team's turn
				console.log("it is now blue turn");
				gameData.isBlueTurn = true;
				gameData.isRedTurn = false;
				io.to(playerData.blueSpyID).emit('createHintBox', gameData);
				io.sockets.emit('waitingForBlueSpy', gameData);
				io.sockets.emit('donePickingCards');
			}
		}
	})

	socket.on('restartGame', function(){
		console.log("restarting game");

		io.to(playerData.blueSpyID).emit('resetSpyBoard', gameData);
		io.to(playerData.redSpyID).emit('resetSpyBoard', gameData);
		io.sockets.emit('restartingGame', playerData);
		io.sockets.emit('resetTheChat');

		playerData.allPlayers = [];
		playerData.spectators = [];
		playerData.bluePlayers = [];
		playerData.blueIDs = [];
		playerData.redPlayers = [];
		playerData.redIDs = [];
		playerData.blueSpyMaster = '';
		playerData.redSpyMaster = '';
		playerData.blueSpyExists = false;
		playerData.redSpyExists = false;
		playerData.blueSpyID = 0;
		playerData.redSpyID = 0;

		gameData.currentBoardColors = ['lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey', 'lightgrey'];
		gameData.gameBoardColors = [];	
		gameData.gameWords = [],
		gameData.turnCounter = 0;
		gameData.isBlueTurn = false;
		gameData.isRedTurn = false;
		gameData.gameHasStarted = false;
		gameData.numBlueCards = 0;
		gameData.numRedCards = 0;
		gameData.numYellowCards = 7;
		gameData.numBlackCards = 1;
		gameData.numCardsToGuess = 0;
		gameData.numCardsPicked = 0;
		gameData.cardSelected = 0;
		gameData.turnIsOver = false;
		gameData.clientCallCounter = 0;
		gameData.runOnce = true;
		gameData.runOnce2 = true;
		gameData.runOnce3 = true;
		gameData.gameOver = false;

		io.sockets.emit('newBoard', gameData);
		io.sockets.emit('resetWords');
		console.log("telling clients to restart");
	})
})
