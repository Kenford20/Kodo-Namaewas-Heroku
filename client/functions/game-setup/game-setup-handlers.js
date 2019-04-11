const blueScoreValue = document.querySelector("#blue-score-number");
const redScoreValue  = document.querySelector("#red-score-number");
const hintInput      = document.querySelector("#hint-input-container");
const gameBoard      = document.querySelector("#game-board");
const allCards       = document.querySelectorAll(".card");

const cardHandlers = require('./card-handlers');
let SHUFFLE_NUMBERS = cardHandlers.shuffleNumbers;
let FETCH_GAME_WORDS = cardHandlers.fetchGameWords;

let SHOW_ELEMENTS = require('../update/hide-show-handlers').showElements;

function showScores({ numBlueCards, numRedCards }){
	blueScoreValue.innerHTML = numBlueCards;
	redScoreValue.innerHTML = numRedCards;
	document.querySelector("#blue-score").style.display = "inline-block";
	document.querySelector("#red-score").style.display = "inline-block";
}

function sendWordsToServer(socket) {
    // about 1000 words in this file, can add/remove any words you want to play with in this file
    let possibleWords = FETCH_GAME_WORDS("words.txt");
    let boardWords = [];

    // take random words from the file of words and push them to the array of 25 words for the game board
    for(let i = 0; i < 25; i++) {
        let randomWord = Math.floor(Math.random() * possibleWords.length);
        boardWords.push(possibleWords[randomWord]);
    }
    socket.emit('setUpGameWords', boardWords);
}

function setStartingBoard(socket, bothSpiesExist, gameisNotStarted){
	if(bothSpiesExist && gameisNotStarted){
		socket.emit('gameHasStarted');
		let boardData = {
			randomIndices: [],
			divColors: []
		}
		let randomNumbers = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];

		boardData.randomIndices = SHUFFLE_NUMBERS(randomNumbers);
        let randomTeamStarts = Math.floor(Math.random() * 2); // returns 0 or 1
        
        const initialCards = {
            redTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
            blueTeamStarts: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'black'],
        };

		if(randomTeamStarts == 0) {
			boardData.divColors = initialCards.blueTeamStarts;
			socket.emit('blueTeamStarts');
        } else if(randomTeamStarts == 1) {
			boardData.divColors = initialCards.redTeamStarts;
			socket.emit('redTeamStarts');
		}
        socket.emit('setUpBoardforSpies', boardData);
        sendWordsToServer(socket);
	} else {
		alert('You need atleast 4 players to play, 2 Supaimasutas and 2 guessers!');
	}
}

function setGameWords(boardWords){
	let gameWords = gameBoard.querySelectorAll("p");
	for(let i = 0; i < gameWords.length; i++)
		gameWords[i].innerHTML = boardWords[i];
}

function setSpyBoardColors(boardData){
	// assign random color to each div or card on the game board
	for(let i = 0; i < allCards.length; i++){
		let randomIndex = boardData.randomIndices[i];
		let randomCardColor = boardData.divColors[randomIndex];
		allCards[i].classList.add(randomCardColor);
	}
}

function createHintBox({ isBlueTurn, numBlueCards, numRedCards }){
    SHOW_ELEMENTS(hintInput);
    
	let selectNode = document.createElement("select");
	hintInput.insertBefore(selectNode, hintInput.firstChild);
	let numCards = isBlueTurn ? numBlueCards : numRedCards;

	// create dropdown menu for number of guesses to the hint
    for(let i = 1; i < (numCards+1); i++){
    	let selectOption = document.createElement("option");
    	selectOption.setAttribute("value", i);
    	selectOption.innerHTML = i;
    	selectNode.appendChild(selectOption);
	}
}

module.exports = {
    setStartingBoard: setStartingBoard,
    showScores: showScores,
    setGameWords: setGameWords,
    setSpyBoardColors: setSpyBoardColors,
    createHintBox: createHintBox
}