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

module.exports = {
    shuffleNumbers: shuffleNumbers,
    fetchGameWords: fetchGameWords
}