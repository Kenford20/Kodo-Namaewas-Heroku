const allCards = document.querySelectorAll(".card");

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

function fetchGameWords(file){
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

// determines which card was selected based on the index in the array of cards
function sendPickedCardToServer(socket, client, pickedCard) {
	const { canGuess, name } = client;
	if(canGuess) { 
		let allCardsArray = [].slice.call(allCards);
		socket.emit('cardWasPicked', allCardsArray.indexOf(pickedCard));
		socket.emit('showGuesser', name);
	} else {
		alert('It is not your turn! Please wait until next round to guess!');
	}
}

// just changes styles for spies when a card is selected so they know what the guesses are
function revealCardForSpies({ cardSelected, gameBoardColors }){
	console.log(allCards);
	let word = allCards[cardSelected].querySelector("p");
	word.style.textDecoration = "line-through";
    allCards[cardSelected].classList.remove('rotate');
    
    let colorToRemove = 
          gameBoardColors[cardSelected] === 'blue' ? 'blue' 
        : gameBoardColors[cardSelected] === 'red' ? 'red'
        : gameBoardColors[cardSelected] === 'yellow' ? 'yellow' : 'black';

    let colorToAdd = 
          gameBoardColors[cardSelected] === 'blue' ? 'blue2' 
        : gameBoardColors[cardSelected] === 'red' ? 'red2'
        : gameBoardColors[cardSelected] === 'yellow' ? 'yellow' : 'black2';

    allCards[cardSelected].classList.remove(colorToRemove);
    allCards[cardSelected].classList.add(colorToAdd);
    allCards[cardSelected].classList.add('rotate');
    
    
	// if(gameBoardColors[cardSelected] == 'blue'){
	// 	allCards[cardSelected].classList.remove('blue');
	// 	allCards[cardSelected].classList.add('blue2');
	// }
	// else if(gameBoardColors[cardSelected] == 'red'){
	// 	allCards[cardSelected].classList.remove('red');
	// 	allCards[cardSelected].classList.add('red2');
	// }
	// else if(gameBoardColors[cardSelected] == 'yellow'){
	// 	allCards[cardSelected].classList.remove('yellow');
	// 	allCards[cardSelected].classList.add('yellow2');		
	// }
	// else{
	// 	allCards[cardSelected].classList.remove('black');
	// 	allCards[cardSelected].classList.add('black2');
	// }
}

// receives the selected card from above and reveals its true color from the game board
// turn ends when the number of selected cards match the number given in the hint
// turn also ends when a yellow or a card from the opposite team is selected
function revealCardColor(socket, gameData){
    const { 
        cardSelected, 
        gameBoardColors, 
        numCardsPicked, 
        numCardsToGuess, 
        isBlueTurn, 
        isRedTurn 
    } = gameData;

	allCards[cardSelected].classList.remove("default");
	allCards[cardSelected].classList.add(gameBoardColors[cardSelected]);
	allCards[cardSelected].classList.remove('rotate');
	socket.emit('updateCardCount', gameBoardColors[cardSelected]);

	if(numCardsPicked < numCardsToGuess) {
		if((isBlueTurn && gameBoardColors[cardSelected] == 'red') ||
		   (isRedTurn && gameBoardColors[cardSelected] == 'blue') ||
           gameBoardColors[cardSelected] == 'yellow') 
           {
			socket.emit('endTurn');
        }
        
		if(gameBoardColors[cardSelected] == 'black')
			socket.emit('blackCard');
	}
	else {
		if(gameBoardColors[cardSelected] == 'black') {
			socket.emit('blackCard');
        } else {
			socket.emit('updateCardCount', gameBoardColors[cardSelected]);
			socket.emit('endTurn');
		}
	}
	allCards[cardSelected].classList.add('rotate');
}

// boolean controlled by the server (will only run for clients when it is their turn to guess)
function enableGuessing(client){
	client.canGuess = true;
}

// players aren't allowed to guess/select cards during the hinting phase 
function disableGuessing(client){
	client.canGuess = false;
}

module.exports = {
    shuffleNumbers: shuffleNumbers,
    fetchGameWords: fetchGameWords,
    sendPickedCardToServer: sendPickedCardToServer,
    revealCardForSpies: revealCardForSpies,
    revealCardColor: revealCardColor,
    enableGuessing: enableGuessing,
    disableGuessing: disableGuessing
}